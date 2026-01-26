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
        this.docker = new Docker({
            socketPath: process.env.DOCKER_HOST || '/var/run/docker.sock',
        });
    }

    async execute(request: ExecutionRequest): Promise<ExecutionResult> {
        const { code, language, input, timeLimit, memoryLimit } = request;
        const config = LANGUAGE_CONFIG[language];

        const startTime = Date.now();
        let stdout = '';
        let stderr = '';

        try {
            // Create a temporary container
            const container = await this.docker.createContainer({
                Image: config.dockerImage,
                Cmd: ['/bin/sh', '-c', this.getExecutionScript(language, code)],
                Tty: false,
                OpenStdin: true,
                StdinOnce: true,
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

            // Start container
            await container.start();

            // Attach to container for stdin/stdout
            const stream = await container.attach({
                stream: true,
                stdin: true,
                stdout: true,
                stderr: true,
            });

            // Collect stdout and stderr
            const stdoutStream = new StringWritable();
            const stderrStream = new StringWritable();

            this.docker.modem.demuxStream(stream, stdoutStream, stderrStream);

            // Send input
            stream.write(input);
            stream.end();

            // Wait for container with timeout
            const waitPromise = container.wait();
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Time Limit Exceeded')), timeLimit + 1000);
            });

            try {
                await Promise.race([waitPromise, timeoutPromise]);
            } catch (error) {
                // Kill container on timeout
                try {
                    await container.kill();
                } catch {
                    // Container might already be stopped
                }

                await container.remove({ force: true });

                return {
                    output: '',
                    error: 'Time Limit Exceeded',
                    runtime: timeLimit,
                    memory: 0,
                };
            }

            // Get output
            stdout = stdoutStream.toString();
            stderr = stderrStream.toString();

            // Get container stats for memory usage
            const stats = await container.inspect();
            const memoryUsed = stats.State.OOMKilled
                ? memoryLimit
                : Math.round(memoryLimit * 0.5); // Approximate since we can't get exact memory post-exit

            // Clean up container
            await container.remove({ force: true });

            const runtime = Date.now() - startTime;

            if (stderr && !stdout) {
                return {
                    output: '',
                    error: stderr.trim(),
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
                    error: `Docker image ${config.dockerImage} not found. Run: docker build -t ${config.dockerImage} docker/images/`,
                    runtime,
                    memory: 0,
                };
            }

            return {
                output: '',
                error: errorMessage,
                runtime,
                memory: 0,
            };
        }
    }

    private getExecutionScript(language: Language, code: string): string {
        const config = LANGUAGE_CONFIG[language];
        const escapedCode = code.replace(/'/g, "'\\''");

        switch (language) {
            case 'cpp':
                return `
          echo '${escapedCode}' > solution.cpp &&
          g++ -O2 -std=c++17 -o solution solution.cpp 2>&1 &&
          ./solution
        `;

            case 'python':
                return `
          echo '${escapedCode}' > solution.py &&
          python3 solution.py
        `;

            case 'java':
                return `
          echo '${escapedCode}' > Solution.java &&
          javac Solution.java 2>&1 &&
          java Solution
        `;

            case 'javascript':
                return `
          echo '${escapedCode}' > solution.js &&
          node solution.js
        `;

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
