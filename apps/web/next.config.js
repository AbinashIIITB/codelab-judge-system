/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@codelab/shared'],
    experimental: {
        serverActions: true,
    },
    images: {
        domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    },
};

module.exports = nextConfig;
