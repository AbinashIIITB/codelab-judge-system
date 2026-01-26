import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import { io as SocketClient, Socket } from 'socket.io-client';
import dotenv from 'dotenv';

import { SUBMISSION_QUEUE_NAME, RUN_CODE_QUEUE_NAME } from '@codelab/shared';
import { processSubmission } from './processors/submissionProcessor';
import { processRunCode } from './processors/runCodeProcessor';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codelab';
const API_WS_URL = process.env.API_WS_URL || 'http://localhost:4000';

// Redis connection
const redisConnection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
});

// Socket.IO client for emitting status updates
let socket: Socket;

async function connectSocket(): Promise<void> {
    socket = SocketClient(API_WS_URL);

    socket.on('connect', () => {
        console.log('📡 Connected to API WebSocket');
    });

    socket.on('disconnect', () => {
        console.log('📡 Disconnected from API WebSocket');
    });
}

export function getSocket(): Socket {
    return socket;
}

// Submission queue worker
const submissionWorker = new Worker(
    SUBMISSION_QUEUE_NAME,
    async (job: Job) => {
        console.log(`📥 Processing submission: ${job.id}`);
        try {
            await processSubmission(job.data, socket);
            console.log(`✅ Completed submission: ${job.id}`);
        } catch (error) {
            console.error(`❌ Failed submission: ${job.id}`, error);
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 5, // Process up to 5 submissions concurrently
    }
);

// Run code queue worker (for quick test runs)
const runCodeWorker = new Worker(
    RUN_CODE_QUEUE_NAME,
    async (job: Job) => {
        console.log(`📥 Processing run code: ${job.id}`);
        try {
            const result = await processRunCode(job.data);
            console.log(`✅ Completed run code: ${job.id}`);
            return result;
        } catch (error) {
            console.error(`❌ Failed run code: ${job.id}`, error);
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 10, // Higher concurrency for quick runs
    }
);

// Event handlers
submissionWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

submissionWorker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});

runCodeWorker.on('completed', (job) => {
    console.log(`Run code job ${job.id} completed`);
});

runCodeWorker.on('failed', (job, error) => {
    console.error(`Run code job ${job?.id} failed:`, error.message);
});

// Graceful shutdown
async function shutdown() {
    console.log('Shutting down workers...');
    await submissionWorker.close();
    await runCodeWorker.close();
    await mongoose.disconnect();
    socket?.disconnect();
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start worker
async function start() {
    try {
        console.log('🚀 Starting CodeLab Worker...');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await connectSocket();

        console.log('✅ Worker is ready and listening for jobs');
    } catch (error) {
        console.error('Failed to start worker:', error);
        process.exit(1);
    }
}

start();
