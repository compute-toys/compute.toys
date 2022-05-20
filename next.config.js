const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: false
})

// cleanup pending these issues:
// https://github.com/vercel/next.js/issues/32612
// https://github.com/vercel/next.js/issues/34940
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['dl.polyhaven.org', process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME]
    },
    async rewrites() {
        return [
            { source: '/new',       destination: '/editor/new' },
            { source: '/view/:id',  destination: '/editor/:id' },
        ]
    },    
    webpack(config, { isServer, dev }) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true
        };
        if (isServer && !dev) {
            config.output.webassemblyModuleFilename = "chunks/[id].wasm";
            config.plugins.push(new WasmChunksFixPlugin());
        }
        config.optimization.moduleIds = 'named';
        return config;
    }
};

class WasmChunksFixPlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap("WasmChunksFixPlugin", (compilation) => {
            compilation.hooks.processAssets.tap(
                { name: "WasmChunksFixPlugin" },
                (assets) =>
                    Object.entries(assets).forEach(([pathname, source]) => {
                        if (!pathname.match(/\.wasm$/)) return;
                        compilation.deleteAsset(pathname);

                        const name = pathname.split("/")[1];
                        const info = compilation.assetsInfo.get(pathname);
                        compilation.emitAsset(name, source, info);
                    })
            );
        });
    }
}

module.exports = withBundleAnalyzer(nextConfig);
