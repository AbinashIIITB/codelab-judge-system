import dotenv from 'dotenv';

// Load env before any module reads process.env
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { env } from './config/env';
import { connectDatabase } from './config/database';
import { initializeQueues, closeQueues } from './config/redis';
import { setupSocketHandlers } from './socket';

import problemRoutes from './routes/problems';
import submissionRoutes from './routes/submissions';
import leaderboardRoutes from './routes/leaderboard';

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: env.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: env.corsOrigin,
    credentials: true,
}));
app.use(express.json({ limit: '256kb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// 404 for unknown API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Catch-all error handler so a thrown error returns JSON instead of an HTML stack
// trace. Express identifies error middleware by arity, so all four params are required.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Socket handlers
setupSocketHandlers(io);

async function startServer() {
    try {
        await connectDatabase();
        await initializeQueues();

        server.listen(env.port, () => {
            console.log(`🚀 API Server running on port ${env.port}`);
            console.log(`📡 WebSocket server ready`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

async function shutdown(signal: string) {
    console.log(`\n${signal} received, shutting down...`);
    server.close();
    io.close();
    await closeQueues();
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

startServer();

export { io };
