/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@codelab/shared'],
    experimental: {},
    images: {
        domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    },
    // Ignore ESLint errors during production build
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ignore TypeScript errors during production build
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
