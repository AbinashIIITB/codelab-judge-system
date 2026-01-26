import mongoose from 'mongoose';
import { Socket } from 'socket.io-client';
import { Language, Verdict, SubmissionStatus, TestCase, TestCaseResult } from '@codelab/shared';
import { DockerExecutor } from '../executor/DockerExecutor';
import { compareOutput } from '../utils/compareOutput';

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

export async function processSubmission(
    job: SubmissionJob,
    socket: Socket
): Promise<void> {
    const { submissionId, problemSlug, code, language, userId } = job;
    const executor = new DockerExecutor();

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
                    if (result.error) {
                        if (result.error.includes('Time Limit')) {
                            verdict = 'Time Limit Exceeded';
                        } else if (result.error.includes('Memory Limit')) {
                            verdict = 'Memory Limit Exceeded';
                        } else if (result.error.includes('Compilation')) {
                            verdict = 'Compilation Error';
                        } else {
                            verdict = 'Runtime Error';
                        }
                    } else {
                        verdict = 'Wrong Answer';
                    }
                }

                // Emit progress update
                emitStatus(socket, userId, submissionId, 'running', {
                    testCasesPassed,
                    totalTestCases: allTestCases.length,
                });

            } catch (error) {
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
