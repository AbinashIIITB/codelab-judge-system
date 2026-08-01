import Docker from 'dockerode';
import { Writable } from 'stream';
import { Language, LANGUAGE_CONFIG } from '@codelab/shared';

interface ExecutionRequest {
    code: string;
    language: Language;
    input: string;
    timeLimit: number;  // in milliseconds
    memoryLimit: number; // in MB
}

export type ExecutionErrorType =
    | 'compilation'
    | 'runtime'
    | 'timeout'
    | 'memory'
    | 'internal';

interface ExecutionResult {
    output: string;
    error?: string;
    errorType?: ExecutionErrorType;
    runtime: number;   // in milliseconds
    memory: number;    // in MB
}

/** Exit code the execution script uses to signal a compile failure. */
const COMPILE_ERROR_EXIT_CODE = 91;

/**
 * Grace period added to a problem's time limit, per language.
 *
 * Compilation and VM startup happen inside the same container as the run, so
 * they land on the same wall clock. Without this allowance a correct Java
 * solution TLEs on a 2s limit purely from `javac` plus JVM boot (~1.7s observed).
 */
const STARTUP_OVERHEAD_MS: Record<Language, number> = {
    cpp: 5000,        // g++ -O2
    java: 6000,       // javac + JVM startup
    python: 2000,
    javascript: 2000,
};

/**
 * Heredoc delimiters used to write the source and the test input into the
 * container. A quoted delimiter means the shell performs no expansion, so both
 * are written byte-for-byte.
 */
const SOURCE_DELIMITER = '__CODELAB_SOURCE_EOF__';
const INPUT_DELIMITER = '__CODELAB_INPUT_EOF__';

export class DockerExecutor {
    private docker: Docker;

    constructor() {
        this.docker = new Docker(DockerExecutor.resolveConnectionOptions());
    }

    /**
     * DOCKER_HOST is conventionally a URL (`unix:///var/run/docker.sock`,
     * `tcp://host:2375`), but dockerode's `socketPath` needs a bare filesystem
     * path. Passing the URL through verbatim made every execution fail with
     * ENOENT, so translate it here.
     */
    private static resolveConnectionOptions(): Docker.DockerOptions {
        const host = process.env.DOCKER_HOST;

        if (!host) {
            return { socketPath: '/var/run/docker.sock' };
        }

        if (host.startsWith('unix://')) {
            return { socketPath: host.slice('unix://'.length) };
        }

        if (host.startsWith('tcp://') || host.startsWith('http://') || host.startsWith('https://')) {
            const url = new URL(host);
            return {
                host: url.hostname,
                port: url.port ? parseInt(url.port, 10) : 2375,
                protocol: host.startsWith('https://') ? 'https' : 'http',
            };
        }

        // Already a plain socket path
        return { socketPath: host };
    }

    async execute(request: ExecutionRequest): Promise<ExecutionResult> {
        const { code, language, input, timeLimit, memoryLimit } = request;
        const config = LANGUAGE_CONFIG[language];

        const startTime = Date.now();
        let stdout = '';
        let stderr = '';
        // Tracked outside the try so the finally block can always clean up —
        // otherwise a failure between create and remove leaks the container.
        let container: Docker.Container | undefined;

        try {
            // Create a temporary container
            container = await this.docker.createContainer({
                Image: config.dockerImage,
                Cmd: ['/bin/sh', '-c', this.getExecutionScript(language, code, input)],
                Tty: false,
                // Test input is written into the container as a file rather than
                // streamed over the attach socket — streaming raced the process
                // start and intermittently delivered truncated stdin.
                OpenStdin: false,
                NetworkDisabled: true, // No network access
                HostConfig: {
                    Memory: memoryLimit * 1024 * 1024, // Convert to bytes
                    MemorySwap: memoryLimit * 1024 * 1024, // Same as memory (no swap)
                    CpuPeriod: 100000,
                    CpuQuota: 50000, // 50% CPU
                    PidsLimit: 64, // Limit number of processes
                    NetworkMode: 'none',
                    SecurityOpt: ['no-new-privileges'],
                    ReadonlyRootfs: false,
                },
            });

            // Attach *before* starting, otherwise output written in the window
            // before the attach lands is lost.
            const stream = await container.attach({
                stream: true,
                stdout: true,
                stderr: true,
            });

            // Collect stdout and stderr
            const stdoutStream = new StringWritable();
            const stderrStream = new StringWritable();

            this.docker.modem.demuxStream(stream, stdoutStream, stderrStream);

            await container.start();

            // Wait for container with timeout
            let timeoutHandle: NodeJS.Timeout | undefined;
            const killAfterMs = timeLimit + STARTUP_OVERHEAD_MS[language];
            const waitPromise = container.wait();
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutHandle = setTimeout(
                    () => reject(new Error('Time Limit Exceeded')),
                    killAfterMs
                );
            });

            let exitCode: number;
            try {
                const waitResult = await Promise.race([waitPromise, timeoutPromise]);
                exitCode = waitResult?.StatusCode ?? 0;
            } catch {
                // Timed out — kill it and report TLE
                try {
                    await container.kill();
                } catch {
                    // Container might already be stopped
                }

                return {
                    output: '',
                    error: 'Time Limit Exceeded',
                    errorType: 'timeout',
                    runtime: timeLimit,
                    memory: 0,
                };
            } finally {
                if (timeoutHandle) clearTimeout(timeoutHandle);
            }

            // Get output
            stdout = stdoutStream.toString();
            stderr = stderrStream.toString();

            // Get container state for memory / OOM info
            const stats = await container.inspect();
            const oomKilled = stats.State.OOMKilled === true;
            const memoryUsed = oomKilled
                ? memoryLimit
                : Math.round(memoryLimit * 0.5); // Approximate — exact usage is gone once the process exits

            const runtime = Date.now() - startTime;

            if (oomKilled) {
                return {
                    output: '',
                    error: 'Memory Limit Exceeded',
                    errorType: 'memory',
                    runtime,
                    memory: memoryLimit,
                };
            }

            if (exitCode === COMPILE_ERROR_EXIT_CODE) {
                return {
                    output: '',
                    error: stderr.trim() || 'Compilation failed',
                    errorType: 'compilation',
                    runtime,
                    memory: memoryUsed,
                };
            }

            if (exitCode !== 0) {
                return {
                    output: stdout.trim(),
                    error: stderr.trim() || `Process exited with code ${exitCode}`,
                    errorType: 'runtime',
                    runtime,
                    memory: memoryUsed,
                };
            }

            return {
                output: stdout.trim(),
                error: stderr ? stderr.trim() : undefined,
                runtime,
                memory: memoryUsed,
            };

        } catch (error) {
            const runtime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Check if it's a Docker image not found error
            if (errorMessage.includes('No such image')) {
                return {
                    output: '',
                    error: `Docker image ${config.dockerImage} not found. Run: docker/images/build.sh`,
                    errorType: 'internal',
                    runtime,
                    memory: 0,
                };
            }

            return {
                output: '',
                error: errorMessage,
                errorType: 'internal',
                runtime,
                memory: 0,
            };
        } finally {
            if (container) {
                try {
                    await container.remove({ force: true });
                } catch {
                    // Already removed, or Docker is unreachable — nothing more to do
                }
            }
        }
    }

    /**
     * Builds the shell script the container runs.
     *
     * Both the submission and the test input are written with quoted heredocs so
     * the shell performs no expansion — `echo` would have mangled any backslash
     * escape in the source (BusyBox `echo` interprets `\n`, silently corrupting
     * submissions), and feeding input this way avoids racing the process start.
     *
     * Compilation is kept separate from execution and exits with a dedicated code
     * so a compile failure is reported as "Compilation Error" rather than being
     * misread as a wrong answer.
     */
    private getExecutionScript(language: Language, code: string, input: string): string {
        // A heredoc ends at a line equal to its delimiter. Neutralise any such
        // line in user-supplied content so it cannot terminate the block early.
        const safe = (text: string, delimiter: string) =>
            text
                .split('\n')
                .map((line) => (line.trimEnd() === delimiter ? ` ${line}` : line))
                .join('\n');

        const heredoc = (filename: string, content: string, delimiter: string) =>
            `cat > ${filename} <<'${delimiter}'\n${safe(content, delimiter)}\n${delimiter}\n`;

        const writeFiles = (sourceName: string) =>
            heredoc(sourceName, code, SOURCE_DELIMITER) +
            heredoc('codelab_input.txt', input, INPUT_DELIMITER);

        const compile = (command: string) =>
            `if ! ${command}; then exit ${COMPILE_ERROR_EXIT_CODE}; fi\n`;

        const run = (command: string) => `exec ${command} < codelab_input.txt\n`;

        switch (language) {
            case 'cpp':
                return (
                    writeFiles('solution.cpp') +
                    compile('g++ -O2 -std=c++17 -o solution solution.cpp') +
                    run('./solution')
                );

            case 'python':
                return (
                    writeFiles('solution.py') +
                    // Byte-compile first so syntax errors surface as compilation errors
                    compile('python3 -m py_compile solution.py') +
                    run('python3 solution.py')
                );

            case 'java':
                return (
                    writeFiles('Solution.java') +
                    compile('javac Solution.java') +
                    run('java Solution')
                );

            case 'javascript':
                return (
                    writeFiles('solution.js') +
                    compile('node --check solution.js') +
                    run('node solution.js')
                );

            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }
}

// Helper class to collect stream output
class StringWritable extends Writable {
    private chunks: Buffer[] = [];

    _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        this.chunks.push(chunk);
        callback();
    }

    toString(): string {
        return Buffer.concat(this.chunks).toString('utf8');
    }
}
