const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@codelab/shared'],

    // Required by apps/web/Dockerfile, which ships .next/standalone.
    output: 'standalone',
    // In a monorepo the tracing root must be the workspace root so the standalone
    // bundle picks up hoisted node_modules and @codelab/shared.
    outputFileTracingRoot: path.join(__dirname, '../../'),

    images: {
        domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    },

    // Lint is run as its own turbo task; keep it out of the build path.
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
