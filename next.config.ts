import type { NextConfig } from 'next';
import { withPlausibleProxy } from 'next-plausible';
const PROD_EMULATION = process.env.PROD_EMULATION === 'yes';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    productionBrowserSourceMaps: PROD_EMULATION,
    experimental: { forceSwcTransforms: PROD_EMULATION }, // Bypass SWC entirely in emulation
    eslint: { ignoreDuringBuilds: true }, // lint checked in CI anyway and fail dramatically

    images: {
        unoptimized: true
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

export default withPlausibleProxy({
    customDomain: 'https://p.compute.toys',
    subdirectory: 'plausible'
})(nextConfig);

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
