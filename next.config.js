const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: false
});

function getImageConfig() {
    const config = {
        remotePatterns: require('./config/allowedtexturesources.json').map(resource => ({
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
    reactStrictMode: true,
    images: getImageConfig(),
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
            config.output.webassemblyModuleFilename = 'chunks/[id].wasm';
            config.plugins.push(new WasmChunksFixPlugin());
        }
        config.optimization.moduleIds = 'named';
        return config;
    }
};

class WasmChunksFixPlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('WasmChunksFixPlugin', compilation => {
            compilation.hooks.processAssets.tap({ name: 'WasmChunksFixPlugin' }, assets =>
                Object.entries(assets).forEach(([pathname, source]) => {
                    if (!pathname.match(/\.wasm$/)) return;
                    compilation.deleteAsset(pathname);

                    const name = pathname.split('/')[1];
                    const info = compilation.assetsInfo.get(pathname);
                    compilation.emitAsset(name, source, info);
                })
            );
        });
    }
}

module.exports = withBundleAnalyzer(nextConfig);
