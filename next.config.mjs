import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import allowedtexturesources from './config/allowedtexturesources.json' with { type: 'json' };

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
    images:
        process.env.NODE_ENV === 'development'
            ? getImageConfig()
            : {
                  loader: 'custom',
                  loaderFile: './lib/util/loader.ts'
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

if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform();
}

export default nextConfig;
