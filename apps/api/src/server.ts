import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { initializeQueues } from './config/redis';
import { setupSocketHandlers } from './socket';

import problemRoutes from './routes/problems';
import submissionRoutes from './routes/submissions';
import leaderboardRoutes from './routes/leaderboard';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Socket handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        await connectDatabase();
        await initializeQueues();

        server.listen(PORT, () => {
            console.log(`🚀 API Server running on port ${PORT}`);
            console.log(`📡 WebSocket server ready`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export { io };
