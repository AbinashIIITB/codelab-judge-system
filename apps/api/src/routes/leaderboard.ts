import { Router, Request, Response } from 'express';
import { Submission, User, Problem } from '../models';

const router = Router();

// GET /api/leaderboard - Global leaderboard
router.get('/', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '50' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        // Aggregate user statistics
        const leaderboard = await Submission.aggregate([
            {
                $match: { verdict: 'Accepted' }
            },
            {
                $group: {
                    _id: '$userId',
                    problemsSolved: { $addToSet: '$problemSlug' },
                    totalSubmissions: { $sum: 1 },
                    lastSolvedAt: { $max: '$createdAt' },
                }
            },
            {
                $project: {
                    userId: '$_id',
                    problemsSolved: { $size: '$problemsSolved' },
                    totalSubmissions: 1,
                    lastSolvedAt: 1,
                }
            },
            {
                $sort: { problemsSolved: -1, lastSolvedAt: 1 }
            },
            {
                $skip: (pageNum - 1) * limitNum
            },
            {
                $limit: limitNum
            }
        ]);

        // Add rank
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: (pageNum - 1) * limitNum + index + 1,
            userId: entry.userId,
            problemsSolved: entry.problemsSolved,
            totalSubmissions: entry.totalSubmissions,
            lastSolvedAt: entry.lastSolvedAt,
        }));

        res.json({ leaderboard: rankedLeaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /api/leaderboard/:problemSlug - Problem-specific leaderboard
router.get('/:problemSlug', async (req: Request, res: Response) => {
    try {
        const { problemSlug } = req.params;
        const { page = '1', limit = '50' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        // Find fastest accepted submissions for this problem
        const leaderboard = await Submission.aggregate([
            {
                $match: {
                    problemSlug: problemSlug,
                    verdict: 'Accepted'
                }
            },
            {
                $sort: { runtime: 1, memory: 1 }
            },
            {
                $group: {
                    _id: '$userId',
                    bestRuntime: { $first: '$runtime' },
                    bestMemory: { $first: '$memory' },
                    language: { $first: '$language' },
                    submissionId: { $first: '$_id' },
                    submittedAt: { $first: '$createdAt' },
                }
            },
            {
                $sort: { bestRuntime: 1, bestMemory: 1 }
            },
            {
                $skip: (pageNum - 1) * limitNum
            },
            {
                $limit: limitNum
            }
        ]);

        // Add rank and calculate percentile
        const totalAccepted = await Submission.countDocuments({
            problemSlug,
            verdict: 'Accepted',
        });

        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: (pageNum - 1) * limitNum + index + 1,
            userId: entry._id,
            runtime: entry.bestRuntime,
            memory: entry.bestMemory,
            language: entry.language,
            percentile: Math.round((1 - (index / totalAccepted)) * 100),
            submittedAt: entry.submittedAt,
        }));

        res.json({
            problemSlug,
            leaderboard: rankedLeaderboard,
            totalParticipants: totalAccepted,
        });
    } catch (error) {
        console.error('Error fetching problem leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch problem leaderboard' });
    }
});

// GET /api/leaderboard/daily/challenge - Get today's daily challenge
router.get('/daily/challenge', async (req: Request, res: Response) => {
    try {
        // Get a problem based on the day of year (rotates daily)
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 0);
        const diff = today.getTime() - startOfYear.getTime();
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

        const problemCount = await Problem.countDocuments();
        const problemIndex = dayOfYear % problemCount;

        const dailyProblem = await Problem.findOne()
            .skip(problemIndex)
            .select('slug title difficulty tags');

        if (!dailyProblem) {
            return res.status(404).json({ error: 'No daily challenge available' });
        }

        res.json({
            date: today.toISOString().split('T')[0],
            problem: dailyProblem,
        });
    } catch (error) {
        console.error('Error fetching daily challenge:', error);
        res.status(500).json({ error: 'Failed to fetch daily challenge' });
    }
});

export default router;
