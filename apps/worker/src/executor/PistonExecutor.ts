import axios, { AxiosError } from 'axios';
import { Language } from '@codelab/shared';

/**
 * Piston-backed executor.
 *
 * IMPORTANT: the public instance at emkc.org became whitelist-only on
 * 2026-02-15 and now answers 401 for unapproved callers. Point PISTON_URL at
 * your own instance (see `docker compose --profile piston up`) or at an
 * instance you have been whitelisted for.
 */
const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000/api/v2/execute';

/** Public Piston allows ~5 req/s; keep some headroom by default. */
const MAX_CONCURRENT = parseInt(process.env.PISTON_MAX_CONCURRENT || '2', 10);
const MAX_RETRIES = 3;

interface ExecutionRequest {
    code: string;
    language: Language;
    input: string;
    timeLimit?: number;
    memoryLimit?: number;
}

export type ExecutionErrorType =
    | 'compilation'
    | 'runtime'
    | 'timeout'
    | 'memory';

/** Shape of a Piston /execute response. */
interface PistonStage {
    stdout?: string;
    stderr?: string;
    code?: number;
    signal?: string | null;
}

interface PistonResponse {
    run?: PistonStage;
    compile?: PistonStage;
    message?: string;
}

interface ExecutionResult {
    output: string;
    error?: string;
    errorType?: ExecutionErrorType;
    runtime: number;
    memory: number;
}

/**
 * Raised when the judge backend itself is unreachable or misconfigured.
 *
 * This is deliberately distinct from a failed submission: blaming the user's
 * code for our outage produced bogus "Runtime Error" verdicts. Callers should
 * let this propagate so the job is retried rather than scored.
 */
export class ExecutionServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExecutionServiceError';
    }
}

const LANGUAGE_MAP: Record<Language, { language: string, version: string }> = {
    cpp: { language: 'cpp', version: '10.2.0' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    javascript: { language: 'javascript', version: '18.15.0' }
};

// Simple process-wide gate so a worker with concurrency > 1 does not exceed the
// instance's rate limit and get every submission thrown out with a 429.
let inFlight = 0;
const waiters: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
    if (inFlight < MAX_CONCURRENT) {
        inFlight++;
        return;
    }
    await new Promise<void>((resolve) => waiters.push(resolve));
    inFlight++;
}

function releaseSlot(): void {
    inFlight--;
    const next = waiters.shift();
    if (next) next();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class PistonExecutor {
    async execute(request: ExecutionRequest): Promise<ExecutionResult> {
        await acquireSlot();
        try {
            return await this.executeInternal(request);
        } finally {
            releaseSlot();
        }
    }

    private async executeInternal(request: ExecutionRequest): Promise<ExecutionResult> {
        const { code, language, input, timeLimit } = request;
        const pistonConfig = LANGUAGE_MAP[language];
        const startedAt = Date.now();

        let lastRateLimitError = '';

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await axios.post(
                    PISTON_URL,
                    {
                        language: pistonConfig.language,
                        version: pistonConfig.version,
                        files: [{ content: code }],
                        stdin: input.endsWith('\n') ? input : `${input}\n`,
                        compile_timeout: 10000,
                        run_timeout: timeLimit || 3000,
                    },
                    { timeout: (timeLimit || 3000) + 20000 }
                );

                return this.interpret(response.data, request, Date.now() - startedAt);
            } catch (error) {
                const axiosError = error as AxiosError;
                const status = axiosError.response?.status;

                // Rate limited — back off and retry rather than failing the user.
                if (status === 429) {
                    lastRateLimitError = 'rate limited';
                    await sleep(500 * Math.pow(2, attempt));
                    continue;
                }

                throw new ExecutionServiceError(this.describeFailure(axiosError, status));
            }
        }

        throw new ExecutionServiceError(
            `Piston at ${PISTON_URL} kept ${lastRateLimitError} after ${MAX_RETRIES} attempts. ` +
            'Lower PISTON_MAX_CONCURRENT or use a dedicated instance.'
        );
    }

    /** Turn a transport failure into a message that says what to actually fix. */
    private describeFailure(error: AxiosError, status?: number): string {
        if (status === 401 || status === 403) {
            return (
                `Piston at ${PISTON_URL} rejected the request (${status}). The public ` +
                'emkc.org instance has been whitelist-only since 2026-02-15. Set ' +
                'PISTON_URL to your own instance (docker compose --profile piston up) ' +
                'or switch EXECUTOR_TYPE=docker.'
            );
        }
        if (status) {
            return `Piston at ${PISTON_URL} returned HTTP ${status}.`;
        }
        return `Could not reach Piston at ${PISTON_URL}: ${error.message}`;
    }

    private interpret(
        data: PistonResponse | undefined,
        request: ExecutionRequest,
        elapsedMs: number
    ): ExecutionResult {
        const { run, compile, message } = data ?? {};

        // Piston reports usage problems as a bare { message } with HTTP 200.
        if (!run) {
            throw new ExecutionServiceError(
                `Piston returned no run result${message ? `: ${message}` : ''}`
            );
        }

        if (compile && compile.code !== 0) {
            return {
                output: '',
                error: (compile.stderr || compile.stdout || 'Compilation failed').trim(),
                errorType: 'compilation',
                runtime: elapsedMs,
                memory: 0,
            };
        }

        // Piston kills over-time and over-memory runs with a signal.
        if (run.signal === 'SIGKILL' || run.signal === 'SIGXCPU') {
            return {
                output: '',
                error: 'Time Limit Exceeded',
                errorType: 'timeout',
                runtime: request.timeLimit ?? 3000,
                memory: 0,
            };
        }

        if (run.code !== 0) {
            return {
                output: (run.stdout ?? '').trim(),
                error: (run.stderr || `Process exited with code ${run.code}`).trim(),
                errorType: 'runtime',
                runtime: elapsedMs,
                memory: 0,
            };
        }

        return {
            output: (run.stdout ?? '').trim(),
            error: undefined,
            // Piston does not report per-run CPU time, so this is wall-clock for
            // the whole request and includes network latency.
            runtime: elapsedMs,
            memory: 0,
        };
    }
}
