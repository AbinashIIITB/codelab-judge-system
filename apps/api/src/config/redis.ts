import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { SUBMISSION_QUEUE_NAME, RUN_CODE_QUEUE_NAME } from '@codelab/shared';
import { env } from './env';

// Redis connection for BullMQ
export const redisConnection = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
});

// Submission queue
export let submissionQueue: Queue;

// Run code queue (for quick test runs)
export let runCodeQueue: Queue;
export let runCodeQueueEvents: QueueEvents;

export async function initializeQueues(): Promise<void> {
    try {
        submissionQueue = new Queue(SUBMISSION_QUEUE_NAME, {
            connection: redisConnection,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 1000,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
            },
        });

        runCodeQueue = new Queue(RUN_CODE_QUEUE_NAME, {
            connection: redisConnection,
            defaultJobOptions: {
                removeOnComplete: 50,
                removeOnFail: 100,
                attempts: 1,
            },
        });

        runCodeQueueEvents = new QueueEvents(RUN_CODE_QUEUE_NAME, {
            connection: redisConnection,
        });

        console.log('✅ BullMQ queues initialized');
    } catch (error) {
        console.error('Failed to initialize queues:', error);
        throw error;
    }
}

export function getSubmissionQueue(): Queue {
    return submissionQueue;
}

export function getRunCodeQueue(): Queue {
    return runCodeQueue;
}

export function getRunCodeQueueEvents(): QueueEvents {
    return runCodeQueueEvents;
}

export async function closeQueues(): Promise<void> {
    await Promise.allSettled([
        submissionQueue?.close(),
        runCodeQueue?.close(),
        runCodeQueueEvents?.close(),
    ]);
    redisConnection.disconnect();
}
