import mongoose from 'mongoose';
import { Socket } from 'socket.io-client';
import { Language, Verdict, SubmissionStatus, TestCaseResult } from '@codelab/shared';
import { DockerExecutor } from '../executor/DockerExecutor';
import { PistonExecutor, ExecutionServiceError } from '../executor/PistonExecutor';
import { compareOutput } from '../utils/compareOutput';

/**
 * Map an executor failure to a verdict.
 *
 * Prefers the structured errorType when the executor supplies one, and falls
 * back to matching the message so either executor works.
 */
function verdictFor(result: { errorType?: string; error?: string }): Verdict {
    switch (result.errorType) {
        case 'timeout': return 'Time Limit Exceeded';
        case 'memory': return 'Memory Limit Exceeded';
        case 'compilation': return 'Compilation Error';
        case 'runtime': return 'Runtime Error';
    }

    const message = result.error;
    if (!message) return 'Wrong Answer';
    if (message.includes('Time Limit')) return 'Time Limit Exceeded';
    if (message.includes('Memory Limit')) return 'Memory Limit Exceeded';
    if (message.includes('Compilation')) return 'Compilation Error';
    return 'Runtime Error';
}

// Submission model (duplicated to avoid circular dependency)
const SubmissionSchema = new mongoose.Schema({
    userId: String,
    problemId: mongoose.Schema.Types.ObjectId,
    problemSlug: String,
    code: String,
    language: String,
    status: String,
    verdict: String,
    runtime: Number,
    memory: Number,
    testCasesPassed: Number,
    totalTestCases: Number,
    testCaseResults: [{
        passed: Boolean,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        runtime: Number,
        memory: Number,
        error: String,
    }],
    error: String,
    completedAt: Date,
}, { timestamps: true });

const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

// Problem model for fetching test cases
const ProblemSchema = new mongoose.Schema({
    slug: String,
    sampleTestCases: [{
        input: String,
        expectedOutput: String,
        isHidden: Boolean,
    }],
    hiddenTestCases: [{
        input: String,
        expectedOutput: String,
        isHidden: Boolean,
    }],
    timeLimit: Number,
    memoryLimit: Number,
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

interface SubmissionJob {
    submissionId: string;
    problemSlug: string;
    code: string;
    language: Language;
    userId: string;
}

const EXECUTOR_TYPE = process.env.EXECUTOR_TYPE || 'docker';

export async function processSubmission(
    job: SubmissionJob,
    socket: Socket
): Promise<void> {
    const { submissionId, problemSlug, code, language, userId } = job;
    const executor = EXECUTOR_TYPE === 'piston' ? new PistonExecutor() : new DockerExecutor();

    try {
        // Update status to compiling
        await updateSubmissionStatus(submissionId, 'compiling');
        emitStatus(socket, userId, submissionId, 'compiling');

        // Fetch problem with test cases
        const problem = await Problem.findOne({ slug: problemSlug });
        if (!problem) {
            throw new Error('Problem not found');
        }

        const allTestCases = [...problem.sampleTestCases, ...problem.hiddenTestCases];
        const timeLimit = problem.timeLimit || 2000;
        const memoryLimit = problem.memoryLimit || 256;

        // Update status to running
        await updateSubmissionStatus(submissionId, 'running');
        emitStatus(socket, userId, submissionId, 'running');

        // Run against all test cases
        const results: TestCaseResult[] = [];
        let totalRuntime = 0;
        let maxMemory = 0;
        let verdict: Verdict = 'Accepted';
        let testCasesPassed = 0;

        for (let i = 0; i < allTestCases.length; i++) {
            const testCase = allTestCases[i];

            try {
                const result = await executor.execute({
                    code,
                    language,
                    input: testCase.input,
                    timeLimit,
                    memoryLimit,
                });

                const passed = compareOutput(result.output, testCase.expectedOutput);

                console.log(`Test Case ${i + 1}: ${passed ? 'PASSED' : 'FAILED'}`);
                if (!passed) {
                    console.log(`  Input: ${testCase.input.replace(/\n/g, '\\n')}`);
                    console.log(`  Expected: "${testCase.expectedOutput.replace(/\n/g, '\\n')}"`);
                    console.log(`  Actual:   "${result.output.replace(/\n/g, '\\n')}"`);
                }

                results.push({
                    passed,
                    input: testCase.isHidden ? undefined : testCase.input,
                    expectedOutput: testCase.isHidden ? undefined : testCase.expectedOutput,
                    actualOutput: testCase.isHidden ? undefined : result.output,
                    runtime: result.runtime,
                    memory: result.memory,
                    error: result.error,
                });

                totalRuntime += result.runtime;
                maxMemory = Math.max(maxMemory, result.memory);

                if (passed) {
                    testCasesPassed++;
                } else if (verdict === 'Accepted') {
                    verdict = verdictFor(result);
                }

                // Emit progress update
                emitStatus(socket, userId, submissionId, 'running', {
                    testCasesPassed,
                    totalTestCases: allTestCases.length,
                });

            } catch (error) {
                // A judge outage is our fault, not the submission's. Let it bubble
                // up so the job is retried instead of scoring a bogus verdict.
                if (error instanceof ExecutionServiceError) {
                    throw error;
                }

                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                results.push({
                    passed: false,
                    error: errorMessage,
                });

                if (verdict === 'Accepted') {
                    verdict = 'Runtime Error';
                }
            }
        }

        // Calculate average runtime
        const avgRuntime = totalRuntime / allTestCases.length;

        // Update final submission status
        await Submission.findByIdAndUpdate(submissionId, {
            status: 'completed',
            verdict,
            runtime: Math.round(avgRuntime),
            memory: maxMemory,
            testCasesPassed,
            totalTestCases: allTestCases.length,
            testCaseResults: results,
            completedAt: new Date(),
        });

        // Emit final status
        emitStatus(socket, userId, submissionId, 'completed', {
            verdict,
            testCasesPassed,
            totalTestCases: allTestCases.length,
            runtime: Math.round(avgRuntime),
            memory: maxMemory,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Judge outage: leave the submission unscored and queued so BullMQ's
        // retries can pick it up once the backend is healthy again. Marking it
        // "Runtime Error" would permanently blame the user for our downtime.
        if (error instanceof ExecutionServiceError) {
            console.error(`⚠️  Judge backend unavailable: ${errorMessage}`);

            await Submission.findByIdAndUpdate(submissionId, { status: 'queued' });
            emitStatus(socket, userId, submissionId, 'queued', {
                error: 'Judge temporarily unavailable — retrying.',
            });

            throw error;
        }

        await Submission.findByIdAndUpdate(submissionId, {
            status: 'completed',
            verdict: 'Runtime Error',
            error: errorMessage,
            completedAt: new Date(),
        });

        emitStatus(socket, userId, submissionId, 'completed', {
            verdict: 'Runtime Error',
            error: errorMessage,
        });

        throw error;
    }
}

async function updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus
): Promise<void> {
    await Submission.findByIdAndUpdate(submissionId, { status });
}

function emitStatus(
    socket: Socket,
    userId: string,
    submissionId: string,
    status: SubmissionStatus,
    extra?: Partial<{
        verdict: Verdict;
        testCasesPassed: number;
        totalTestCases: number;
        runtime: number;
        memory: number;
        error: string;
    }>
): void {
    socket.emit('worker:submission:status', {
        userId,
        submissionId,
        status,
        ...extra,
    });
}
