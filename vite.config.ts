import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
    plugins: [
        react(),
        // Custom plugin to handle WASM files
        {
            name: 'wasm-handler',
            generateBundle() {
                try {
                    mkdirSync('dist/src/wasm', { recursive: true });
                    copyFileSync('src/wasm/slang-wasm.js', 'dist/src/wasm/slang-wasm.js');
                    copyFileSync('src/wasm/slang-wasm.wasm', 'dist/src/wasm/slang-wasm.wasm');
                    console.log('WASM files copied to dist/src/wasm');
                } catch (err) {
                    console.error('Failed to copy WASM files:', err);
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
    // Handle shader and WASM files
    assetsInclude: ['**/*.slang', '**/*.wgsl', '**/*.wasm'],
});