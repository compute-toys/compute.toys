const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://compute-toys.github.io/slang-playground/wasm/slang-wasm';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const WASM_DIR = path.join(PUBLIC_DIR, 'wasm');

// Ensure wasm directory exists
if (!fs.existsSync(WASM_DIR)) {
    fs.mkdirSync(WASM_DIR, { recursive: true });
}

/**
 * Download a file from a URL to a local path
 */
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${url} to ${outputPath}`);
        
        const file = fs.createWriteStream(outputPath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✓ Downloaded ${path.basename(outputPath)}`);
                resolve();
            });
            
            file.on('error', (err) => {
                fs.unlink(outputPath, () => {}); // Delete the file on error
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Check if a file exists and has content
 */
function fileExists(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.isFile() && stats.size > 0;
    } catch {
        return false;
    }
}

/**
 * Main function to download all required files
 */
async function downloadWasmFiles() {
    try {
        const force = process.argv.includes('--force');
        const wasmPath = path.join(WASM_DIR, 'slang-wasm.wasm.gz');
        const jsPath = path.join(WASM_DIR, 'slang-wasm.js');
        
        // Check if files already exist
        const wasmExists = fileExists(wasmPath);
        const jsExists = fileExists(jsPath);
        
        if (wasmExists && jsExists && !force) {
            console.log('✓ slang-wasm files already exist, skipping download');
            console.log('  Use --force to re-download');
            return;
        }
        
        console.log('Downloading slang-wasm files...');
        
        // Download the compressed WASM binary if missing or forced
        if (!wasmExists || force) {
            await downloadFile(`${BASE_URL}.wasm.gz`, wasmPath);
        } else {
            console.log('✓ slang-wasm.wasm.gz already exists, skipping');
        }
        
        // Download the JavaScript glue code if missing or forced
        if (!jsExists || force) {
            await downloadFile(`${BASE_URL}.js`, jsPath);
        } else {
            console.log('✓ slang-wasm.js already exists, skipping');
        }
        
        console.log('✓ All slang-wasm files are ready!');
    } catch (error) {
        console.error('✗ Error downloading slang-wasm files:', error.message);
        process.exit(1);
    }
}

// Run the download if this script is executed directly
if (require.main === module) {
    downloadWasmFiles();
}
