import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import withBundleAnalyzer from '@next/bundle-analyzer';
import CopyPlugin from 'copy-webpack-plugin';
import allowedtexturesources from './config/allowedtexturesources.json' with { type: 'json' };

function getImageConfig() {
    const config = {
        remotePatterns: allowedtexturesources.map(resource => ({
            hostname: resource.domain
        }))
    };

    if (process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME) {
        config.remotePatterns.push({ hostname: process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME });
    } else {
        console.warn(
            'NEXT_PUBLIC_SUPABASE_HOSTNAME is not set, images from supabase will not be loaded'
        );
        config.unoptimized = true;
    }
    return config;
}

// cleanup pending these issues:
// https://github.com/vercel/next.js/issues/32612
// https://github.com/vercel/next.js/issues/34940
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:
        process.env.NODE_ENV === 'development'
            ? true
            : false,
    images:
        process.env.NODE_ENV === 'development'
            ? getImageConfig()
            : {
                  loader: 'custom',
                  loaderFile: './lib/util/loader.ts'
              },
    experimental: {
        esmExternals: 'loose'
    },
    async redirects() {
        return [
            {
                source: '/editor/:id',
                destination: '/view/:id',
                permanent: true
            }
        ];
    },
    async rewrites() {
        return [
            {
                source: '/',
                destination: '/list/1'
            }
        ];
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
