import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import withBundleAnalyzer from '@next/bundle-analyzer';
import CopyPlugin from 'copy-webpack-plugin';

// cleanup pending these issues:
// https://github.com/vercel/next.js/issues/32612
// https://github.com/vercel/next.js/issues/34940
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    images: {
        unoptimized: true,
    },
    experimental: {
        esmExternals: 'loose'
    },
    webpack(config, { isServer, dev }) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true
        };
        if (isServer && !dev) {
            const patterns = [];
            const destinations = [
                '../static/wasm/[name][ext]', // -> .next/static/wasm
                './static/wasm/[name][ext]', // -> .next/server/static/wasm
                '.' // -> .next/server/chunks (for some reason this is necessary)
            ];
            for (const dest of destinations) {
                patterns.push({
                    context: '.next/server/chunks',
                    from: '.',
                    to: dest,
                    filter: resourcePath => resourcePath.endsWith('.wasm'),
                    noErrorOnMissing: true
                });
            }
            config.plugins.push(new CopyPlugin({ patterns }));
        }
        return config;
    }
};

if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform();
}

export default withBundleAnalyzer({ enabled: false })(nextConfig);
