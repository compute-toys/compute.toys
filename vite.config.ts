import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        wasm(),
        topLevelAwait(),
        // Custom plugin to handle shader files as text
        {
            name: 'shader-loader',
            load(id) {
                if (id.endsWith('.slang') || id.endsWith('.wgsl')) {
                    const fs = require('fs');
                    const content = fs.readFileSync(id, 'utf-8');
                    return `export default ${JSON.stringify(content)};`;
                }
            }
        }
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'lib': path.resolve(__dirname, './lib'),
            'components': path.resolve(__dirname, './components'),
            'standalone-editor': path.resolve(__dirname, './standalone-editor'),
            'types': path.resolve(__dirname, './types'),
            'theme': path.resolve(__dirname, './theme'),
        },
    },
    server: {
        port: 3000,
    },
    publicDir: 'public',
    build: {
        target: 'esnext',
        minify: 'esbuild',
        outDir: 'dist',
        rollupOptions: {
            input: {
                // Each route type gets its own HTML template
                index: path.resolve(__dirname, 'index.html'),
                view: path.resolve(__dirname, 'view.html'),
                list: path.resolve(__dirname, 'list.html'),
                userid: path.resolve(__dirname, 'userid.html'),
                login: path.resolve(__dirname, 'login.html'),
                new: path.resolve(__dirname, 'new.html'),
            },
        },
    },
    // WASM is handled by vite-plugin-wasm, shader files imported as text modules
});