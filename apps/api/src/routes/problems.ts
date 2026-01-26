import { Router, Request, Response } from 'express';
import { Problem } from '../models';
import { Difficulty } from '@codelab/shared';

const router = Router();

// GET /api/problems - List all problems with optional filters
router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            search,
            difficulty,
            tag,
            page = '1',
            limit = '20',
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // Build query
        const query: Record<string, unknown> = {};

        if (search && typeof search === 'string') {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        if (difficulty && typeof difficulty === 'string') {
            query.difficulty = difficulty as Difficulty;
        }

        if (tag && typeof tag === 'string') {
            query.tags = { $in: [tag.toLowerCase()] };
        }

        // Pagination
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Sort
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortField = sortBy as string;

        const [problems, total] = await Promise.all([
            Problem.find(query)
                .select('slug title difficulty tags createdAt')
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limitNum),
            Problem.countDocuments(query),
        ]);

        res.json({
            problems,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
});

// GET /api/problems/:slug - Get single problem by slug
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const problem = await Problem.findOne({ slug });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Transform starterCode Map to plain object
        const problemObj = problem.toJSON();
        if (problem.starterCode instanceof Map) {
            problemObj.starterCode = Object.fromEntries(problem.starterCode);
        }

        res.json(problemObj);
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
});

// GET /api/problems/:slug/testcases - Get hidden test cases (for worker only - should be protected)
router.get('/:slug/testcases', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const apiKey = req.headers['x-api-key'];

        // Simple API key check for internal worker access
        if (apiKey !== process.env.WORKER_API_KEY) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const problem = await Problem.findOne({ slug })
            .select('sampleTestCases hiddenTestCases timeLimit memoryLimit');

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        res.json({
            testCases: [...problem.sampleTestCases, ...problem.hiddenTestCases],
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
        });
    } catch (error) {
        console.error('Error fetching test cases:', error);
        res.status(500).json({ error: 'Failed to fetch test cases' });
    }
});

export default router;
