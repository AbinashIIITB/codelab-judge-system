import { Server, Socket } from 'socket.io';
import { env } from '../config/env';

interface WorkerStatusPayload {
    userId?: string;
    submissionId: string;
    status: string;
    verdict?: string;
    testCasesPassed?: number;
    totalTestCases?: number;
    runtime?: number;
    memory?: number;
    error?: string;
}

export function setupSocketHandlers(io: Server): void {
    io.on('connection', (socket: Socket) => {
        // The worker connects with the shared secret so it can push status updates.
        const isWorker = socket.handshake.auth?.workerKey === env.workerApiKey;

        console.log(`Client connected: ${socket.id}${isWorker ? ' (worker)' : ''}`);

        // Join user-specific room for targeted updates
        socket.on('join:user', (userId: string) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        // Follow a single submission. This is what actually drives the live verdict
        // in the UI — the client knows its submission id without needing an identity.
        socket.on('join:submission', (submissionId: string) => {
            socket.join(`submission:${submissionId}`);
        });

        socket.on('leave:submission', (submissionId: string) => {
            socket.leave(`submission:${submissionId}`);
        });

        // Join problem room for leaderboard updates
        socket.on('join:problem', (problemSlug: string) => {
            socket.join(`problem:${problemSlug}`);
            console.log(`Client joined problem room: ${problemSlug}`);
        });

        // Leave problem room
        socket.on('leave:problem', (problemSlug: string) => {
            socket.leave(`problem:${problemSlug}`);
        });

        // Join global leaderboard room
        socket.on('join:leaderboard', () => {
            socket.join('leaderboard');
            console.log('Client joined global leaderboard room');
        });

        // Relay worker progress to the browsers watching that submission.
        // Without this the worker's updates were emitted into the void and the UI
        // stayed stuck on "Submitting...".
        if (isWorker) {
            socket.on('worker:submission:status', (payload: WorkerStatusPayload) => {
                if (!payload?.submissionId) return;

                const { userId, ...update } = payload;

                io.to(`submission:${payload.submissionId}`).emit('submission:status', update);

                if (userId) {
                    io.to(`user:${userId}`).emit('submission:status', update);
                }
            });
        }

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

// Helper function to emit submission status updates
export function emitSubmissionStatus(
    io: Server,
    userId: string,
    data: {
        submissionId: string;
        status: string;
        verdict?: string;
        testCasesPassed?: number;
        totalTestCases?: number;
        runtime?: number;
        memory?: number;
        error?: string;
    }
): void {
    io.to(`user:${userId}`).emit('submission:status', data);
    io.to(`submission:${data.submissionId}`).emit('submission:status', data);
}

// Helper function to emit leaderboard updates
export function emitLeaderboardUpdate(
    io: Server,
    problemSlug: string,
    data: {
        userId: string;
        runtime: number;
        memory: number;
        rank: number;
    }
): void {
    io.to(`problem:${problemSlug}`).emit('leaderboard:update', data);
    io.to('leaderboard').emit('leaderboard:update', { problemSlug, ...data });
}
