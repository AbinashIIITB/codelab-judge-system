import { Language, TestCase } from '@codelab/shared';
import { DockerExecutor } from '../executor/DockerExecutor';
import { compareOutput } from '../utils/compareOutput';

interface RunCodeJob {
    problemSlug: string;
    code: string;
    language: Language;
    customInput?: string;
    testCases: TestCase[];
    timeLimit: number;
    memoryLimit: number;
}

interface RunCodeResult {
    output: string;
    error?: string;
    runtime: number;
    memory: number;
    testResults?: Array<{
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
    }>;
}

export async function processRunCode(job: RunCodeJob): Promise<RunCodeResult> {
    const { code, language, customInput, testCases, timeLimit, memoryLimit } = job;
    const executor = new DockerExecutor();

    // If custom input is provided, just run the code and return output
    if (customInput !== undefined) {
        const result = await executor.execute({
            code,
            language,
            input: customInput,
            timeLimit,
            memoryLimit,
        });

        return {
            output: result.output,
            error: result.error,
            runtime: result.runtime,
            memory: result.memory,
        };
    }

    // Otherwise, run against sample test cases
    const testResults: Array<{
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
    }> = [];

    let totalRuntime = 0;
    let maxMemory = 0;
    let lastError: string | undefined;

    for (const testCase of testCases) {
        try {
            const result = await executor.execute({
                code,
                language,
                input: testCase.input,
                timeLimit,
                memoryLimit,
            });

            const passed = compareOutput(result.output, testCase.expectedOutput);

            testResults.push({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: result.output,
                passed,
            });

            totalRuntime += result.runtime;
            maxMemory = Math.max(maxMemory, result.memory);

            if (result.error) {
                lastError = result.error;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            testResults.push({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: '',
                passed: false,
            });

            lastError = errorMessage;
        }
    }

    const avgRuntime = testResults.length > 0 ? totalRuntime / testResults.length : 0;

    return {
        output: testResults.map(r => r.actualOutput).join('\n---\n'),
        error: lastError,
        runtime: Math.round(avgRuntime),
        memory: maxMemory,
        testResults,
    };
}
