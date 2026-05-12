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

        // Join specific submission room
        socket.on('join:submission', (submissionId: string) => {
            socket.join(`submission:${submissionId}`);
            console.log(`Client joined submission room: ${submissionId}`);
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

        // Bridge for Worker updates to Clients
        socket.on('worker:submission:status', (data) => {
            const { userId, submissionId, ...update } = data;
            
            // Forward to user-specific room
            if (userId) {
                io.to(`user:${userId}`).emit('submission:status', { submissionId, ...update });
            }
            
            // Also broadcast to a specific submission room (useful for guest submissions)
            io.to(`submission:${submissionId}`).emit('submission:status', { submissionId, ...update });
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
