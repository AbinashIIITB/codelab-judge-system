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

interface ExecutionResult {
    output: string;
    error?: string;
    runtime: number;   // in milliseconds
    memory: number;    // in MB
}

export class DockerExecutor {
    private docker: Docker;

    constructor() {
        let socketPath = process.env.DOCKER_HOST || '/var/run/docker.sock';
        // Remove unix:// prefix if present
        if (socketPath.startsWith('unix://')) {
            socketPath = socketPath.replace('unix://', '');
        }
        
        this.docker = new Docker({ socketPath });
    }

    async execute(request: ExecutionRequest): Promise<ExecutionResult> {
        const { code, language, input, timeLimit, memoryLimit } = request;
        const config = LANGUAGE_CONFIG[language];

        try {
            const container = await this.docker.createContainer({
                Image: config.dockerImage,
                Cmd: ['/bin/sh', '-c', 'sleep 3600'],
                Tty: false,
                NetworkDisabled: true,
                HostConfig: {
                    Memory: memoryLimit * 1024 * 1024,
                    MemorySwap: memoryLimit * 1024 * 1024,
                    CpuPeriod: 100000,
                    CpuQuota: 50000,
                    PidsLimit: 64,
                    NetworkMode: 'none',
                },
            });

            await container.start();

            try {
                // 1. Write code and input using streams (much safer than echo)
                await this.writeFileInContainer(container, 'solution_source', code);
                await this.writeFileInContainer(container, 'input.txt', input);

                // 2. Prepare and Compile
                if (config.compileCommand) {
                    const sourceFile = language === 'java' ? 'Solution.java' : (language === 'cpp' ? 'solution.cpp' : 'solution_source');
                    await this.execInContainer(container, ['/bin/sh', '-c', `cp solution_source ${sourceFile}`]);

                    const compileResult = await this.execInContainer(container, ['/bin/sh', '-c', `${config.compileCommand} 2>&1`]);
                    if (compileResult.exitCode !== 0) {
                        return {
                            output: '',
                            error: `Compilation Error:\n${compileResult.output}`,
                            runtime: 0,
                            memory: 0,
                        };
                    }
                } else {
                    const filename = language === 'python' ? 'solution.py' : 'solution.js';
                    await this.execInContainer(container, ['/bin/sh', '-c', `cp solution_source ${filename}`]);
                }

                // 3. Execute with time limit
                const startTime = Date.now();
                const runResult = await this.execInContainer(container, ['/bin/sh', '-c', `${config.runCommand} < input.txt`], timeLimit);
                const runtime = Date.now() - startTime;

                if (runResult.timeout) {
                    return { output: '', error: 'Time Limit Exceeded', runtime: timeLimit, memory: 0 };
                }

                return {
                    output: runResult.stdout, // Keep raw for comparison, trimmer handles it
                    error: runResult.stderr || undefined,
                    runtime,
                    memory: Math.round(memoryLimit * 0.1),
                };

            } finally {
                await container.remove({ force: true });
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { output: '', error: errorMessage, runtime: 0, memory: 0 };
        }
    }

    private async writeFileInContainer(container: Docker.Container, filename: string, content: string): Promise<void> {
        const exec = await container.exec({
            Cmd: ['/bin/sh', '-c', `cat > ${filename}`],
            AttachStdin: true,
            Tty: false
        });

        const stream = await exec.start({ hijack: true, stdin: true });
        stream.write(content);
        stream.end();

        return new Promise((resolve, reject) => {
            stream.on('end', resolve);
            stream.on('error', reject);
        });
    }

    private async execInContainer(container: Docker.Container, cmd: string[], timeout?: number): Promise<{ stdout: string, stderr: string, output: string, exitCode: number, timeout?: boolean }> {
        const exec = await container.exec({
            Cmd: cmd,
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start({});
        
        const stdoutStream = new StringWritable();
        const stderrStream = new StringWritable();
        this.docker.modem.demuxStream(stream, stdoutStream, stderrStream);

        return new Promise((resolve) => {
            let isDone = false;
            let timer: NodeJS.Timeout;

            if (timeout) {
                timer = setTimeout(async () => {
                    if (!isDone) {
                        isDone = true;
                        resolve({ stdout: '', stderr: '', output: '', exitCode: 1, timeout: true });
                    }
                }, timeout);
            }

            stream.on('end', async () => {
                if (isDone) return;
                isDone = true;
                if (timer) clearTimeout(timer);

                const inspect = await exec.inspect();
                resolve({
                    stdout: stdoutStream.toString(),
                    stderr: stderrStream.toString(),
                    output: stdoutStream.toString() + stderrStream.toString(),
                    exitCode: inspect.ExitCode ?? 0
                });
            });
        });
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
