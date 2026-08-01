/**
 * Centralized environment configuration.
 *
 * Reading env vars in one place means a misconfigured deployment fails loudly
 * at startup instead of silently degrading (e.g. an unset WORKER_API_KEY
 * used to make the hidden-test-case endpoint world-readable).
 */

const isProduction = process.env.NODE_ENV === 'production';

/** Shared secret the worker uses to authenticate to the API. */
function resolveWorkerApiKey(): string {
    const key = process.env.WORKER_API_KEY;

    if (!key) {
        if (isProduction) {
            throw new Error(
                'WORKER_API_KEY must be set in production. It guards the hidden test case ' +
                'endpoint and the worker status relay.'
            );
        }
        console.warn('⚠️  WORKER_API_KEY is not set — falling back to an insecure dev default.');
        return 'dev-worker-key';
    }

    return key;
}

/**
 * Allowed CORS origins. `CORS_ORIGIN` accepts a comma-separated list.
 * In development we reflect any origin so phones/other devices on the LAN work.
 */
function resolveCorsOrigin(): string[] | boolean {
    const raw = process.env.CORS_ORIGIN;

    if (!raw) {
        if (isProduction) {
            throw new Error(
                'CORS_ORIGIN must be set in production (comma-separated list of allowed origins).'
            );
        }
        return true; // reflect request origin — dev only
    }

    if (raw === '*') {
        return true;
    }

    return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export const env = {
    isProduction,
    port: parseInt(process.env.PORT || '4000', 10),
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/codelab',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    corsOrigin: resolveCorsOrigin(),
    workerApiKey: resolveWorkerApiKey(),
};
