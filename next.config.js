// cleanup pending this issue: https://github.com/vercel/next.js/issues/32612
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['dl.polyhaven.org'],
    },
    async rewrites() {
        return [
            { source: '/new',       destination: '/editor/new' },
            { source: '/view/:id',  destination: '/editor/:id' },
        ]
    },
    webpack(config, { isServer }) {
        if (isServer) {
            config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm';
        } else {
            config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
        }
        config.experiments = { asyncWebAssembly: true };
        config.optimization.moduleIds = 'named';

        return config;
    }
};

module.exports = nextConfig;