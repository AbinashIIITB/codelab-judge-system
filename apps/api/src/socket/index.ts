import { Server, Socket } from 'socket.io';

export function setupSocketHandlers(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Join user-specific room for targeted updates
        socket.on('join:user', (userId: string) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined their room`);
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
