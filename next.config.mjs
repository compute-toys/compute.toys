import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import allowedtexturesources from './config/allowedtexturesources.json' with { type: 'json' };

const DEVELOPMENT = process.env.NODE_ENV === 'development';
const PROD_EMULATION = process.env.PROD_EMULATION === 'yes';

function getImageConfig() {
    const config = {
        remotePatterns: allowedtexturesources.map(resource => ({
            hostname: resource.domain
        }))
    };

    if (process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID) {
        config.remotePatterns.push({
            hostname: `${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`
        });
    } else {
        console.warn(
            'NEXT_PUBLIC_SUPABASE_PROJECT_ID is not set, images from supabase will not be loaded'
        );
        config.unoptimized = true;
    }
    return config;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    productionBrowserSourceMaps: PROD_EMULATION,
    experimental: { forceSwcTransforms: PROD_EMULATION }, // Bypass SWC entirely in emulation
    eslint: { ignoreDuringBuilds: true }, // lint checked in CI anyway and fail dramatically

    images: DEVELOPMENT
        ? getImageConfig()
        : {
              loader: 'custom',
              loaderFile: './lib/util/loader.ts'
          },

    webpack: config => {
        if (PROD_EMULATION) {
            config.optimization.minimize = false;
            config.optimization.minimizer = [];
            config.devtool = 'cheap-module-source-map'; // https://webpack.js.org/configuration/devtool/
        }

        // Shaders configuration
        config.module.rules.push({
            test: /\.(slang|wgsl)$/,
            type: 'asset/source'
        });
        return config;
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
    }
};

if (DEVELOPMENT) {
    await setupDevPlatform();
}

export default nextConfig;
