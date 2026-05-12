import axios from 'axios';
import { Language } from '@codelab/shared';

const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';

interface ExecutionRequest {
    code: string;
    language: Language;
    input: string;
    timeLimit?: number;
    memoryLimit?: number;
}

interface ExecutionResult {
    output: string;
    error?: string;
    runtime: number;
    memory: number;
}

const LANGUAGE_MAP: Record<Language, { language: string, version: string }> = {
    cpp: { language: 'cpp', version: '10.2.0' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    javascript: { language: 'javascript', version: '18.15.0' }
};

export class PistonExecutor {
    async execute(request: ExecutionRequest): Promise<ExecutionResult> {
        const { code, language, input } = request;
        const pistonConfig = LANGUAGE_MAP[language];

        try {
            const response = await axios.post(PISTON_URL, {
                language: pistonConfig.language,
                version: pistonConfig.version,
                files: [
                    {
                        content: code,
                    },
                ],
                stdin: input,
                compile_timeout: 10000,
                run_timeout: request.timeLimit || 3000,
            });

            const { run, compile } = response.data;

            // Handle compilation errors
            if (compile && compile.code !== 0) {
                return {
                    output: '',
                    error: `Compilation Error:\n${compile.stderr || compile.stdout}`,
                    runtime: 0,
                    memory: 0,
                };
            }

            // Handle runtime errors
            if (run.code !== 0 && run.stderr) {
                // Check if it's a timeout (Piston doesn't always explicitly say timeout)
                if (run.signal === 'SIGKILL' || run.stderr.includes('timeout')) {
                    return {
                        output: '',
                        error: 'Time Limit Exceeded',
                        runtime: request.timeLimit ?? 3000,
                        memory: 0,
                    };
                }

                return {
                    output: run.stdout,
                    error: run.stderr,
                    runtime: 0,
                    memory: 0,
                };
            }

            return {
                output: run.stdout,
                error: undefined,
                runtime: 100, // Piston doesn't provide precise runtime per test case
                memory: 0,
            };

        } catch (error) {
            console.error('Piston API Error:', error);
            return {
                output: '',
                error: 'Execution Service Unavailable',
                runtime: 0,
                memory: 0,
            };
        }
    }
}
