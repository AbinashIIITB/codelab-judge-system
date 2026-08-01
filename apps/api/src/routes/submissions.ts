import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { Submission, Problem } from '../models';
import { getSubmissionQueue, getRunCodeQueue, getRunCodeQueueEvents } from '../config/redis';
import { SubmitRequest, RunCodeRequest, Language, SUPPORTED_LANGUAGES } from '@codelab/shared';

const router = Router();

const MAX_CODE_LENGTH = 100_000;

/** Returns an error message if the payload is invalid, otherwise null. */
function validateCodePayload(
    problemSlug: unknown,
    code: unknown,
    language: unknown
): string | null {
    if (!problemSlug || !code || !language) {
        return 'Missing required fields: problemSlug, code, language';
    }
    if (typeof code !== 'string' || code.length > MAX_CODE_LENGTH) {
        return `Code must be a string of at most ${MAX_CODE_LENGTH} characters`;
    }
    if (!SUPPORTED_LANGUAGES.includes(language as Language)) {
        return `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`;
    }
    return null;
}

// POST /api/submissions - Submit code for full evaluation
router.post('/', async (req: Request, res: Response) => {
    try {
        const { problemSlug, code, language } = req.body as SubmitRequest;

        // TODO: Get actual user ID from auth session
        const userId = req.headers['x-user-id'] as string || 'anonymous';

        // Validate input
        const validationError = validateCodePayload(problemSlug, code, language);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        // Check if problem exists
        const problem = await Problem.findOne({ slug: problemSlug });
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const totalTestCases = problem.sampleTestCases.length + problem.hiddenTestCases.length;
        if (totalTestCases === 0) {
            return res.status(422).json({ error: 'Problem has no test cases configured' });
        }

        // Create submission record
        const submission = await Submission.create({
            userId,
            problemId: problem._id,
            problemSlug,
            code,
            language: language as Language,
            status: 'pending',
            totalTestCases,
        });

        // Add to queue
        const queue = getSubmissionQueue();
        await queue.add('submission', {
            submissionId: submission._id.toString(),
            problemSlug,
            code,
            language,
            userId,
        }, {
            jobId: submission._id.toString(),
        });

        // Update status to queued
        submission.status = 'queued';
        await submission.save();

        // Emit initial status via WebSocket
        const io: Server = req.app.get('io');
        io.to(`user:${userId}`).emit('submission:status', {
            submissionId: submission._id.toString(),
            status: 'queued',
        });

        res.status(201).json({
            submissionId: submission._id.toString(),
            status: 'queued',
        });
    } catch (error) {
        console.error('Error creating submission:', error);
        res.status(500).json({ error: 'Failed to create submission' });
    }
});

// POST /api/submissions/run - Run code against sample/custom test cases only
router.post('/run', async (req: Request, res: Response) => {
    try {
        const { problemSlug, code, language, customInput } = req.body as RunCodeRequest;

        // Validate input
        const validationError = validateCodePayload(problemSlug, code, language);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        // Get sample test cases
        const problem = await Problem.findOne({ slug: problemSlug })
            .select('sampleTestCases timeLimit memoryLimit');

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Add to run queue (faster processing)
        const queue = getRunCodeQueue();
        const job = await queue.add('run-code', {
            problemSlug,
            code,
            language,
            customInput,
            testCases: customInput
                ? [{ input: customInput, expectedOutput: '', isHidden: false }]
                : problem.sampleTestCases,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
        });

        // Wait for result (with timeout)
        const queueEvents = getRunCodeQueueEvents();
        const result = await job.waitUntilFinished(queueEvents, 30000);

        res.json(result);
    } catch (error) {
        console.error('Error running code:', error);
        const message = error instanceof Error ? error.message : '';

        // waitUntilFinished rejects with a timeout message when no worker picks
        // the job up — surface that instead of a generic 500.
        if (message.includes('timed out') || message.includes('timeout')) {
            return res.status(504).json({
                error: 'Execution timed out. The judge worker may be unavailable.',
            });
        }

        res.status(500).json({ error: 'Failed to run code' });
    }
});

// GET /api/submissions/:id - Get submission status/result
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = await Submission.findById(id);

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json(submission.toJSON());
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

// GET /api/submissions/user/:userId - Get user's submissions
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { problemSlug, page = '1', limit = '20' } = req.query;

        const query: Record<string, unknown> = { userId };
        if (problemSlug) {
            query.problemSlug = problemSlug;
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const submissions = await Submission.find(query)
            .select('problemSlug language status verdict runtime memory createdAt')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        res.json({ submissions });
    } catch (error) {
        console.error('Error fetching user submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

export default router;
