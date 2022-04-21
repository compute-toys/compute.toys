// cleanup pending these issues:
// https://github.com/vercel/next.js/issues/32612
// https://github.com/vercel/next.js/issues/34940
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack(config, { isServer, dev }) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true
        };
        if (isServer) {
            config.output.webassemblyModuleFilename = "chunks/[id].wasm";
            config.plugins.push(new WasmChunksFixPlugin());
        }

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

module.exports = nextConfig;