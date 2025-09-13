#!/bin/bash

# Configuration - update this to change the Slang version
SLANG_VERSION="2025.16.1"
SLANG_REPO="shader-slang/slang"
ZIP_URL="https://github.com/${SLANG_REPO}/releases/download/v${SLANG_VERSION}/slang-${SLANG_VERSION}-wasm.zip"

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="${SCRIPT_DIR}/../public"
WASM_DIR="${PUBLIC_DIR}/wasm"
TYPES_DIR="${SCRIPT_DIR}/../types"
ZIP_PATH="${WASM_DIR}/slang-wasm.zip"

# Ensure wasm directory exists
mkdir -p "${WASM_DIR}"

# Check if files already exist
WASM_PATH="${WASM_DIR}/slang-wasm.wasm"
JS_PATH="${WASM_DIR}/slang-wasm.js"
TYPES_PATH="${TYPES_DIR}/slang-wasm.d.ts"

if [[ "$1" != "--force" ]] && [[ -f "${WASM_PATH}" ]] && [[ -f "${JS_PATH}" ]] && [[ -f "${TYPES_PATH}" ]]; then
    echo "✓ slang-wasm files already exist, skipping download"
    echo "  Use --force to re-download"
    exit 0
fi

echo "Downloading Slang ${SLANG_VERSION} WASM files..."
echo "Source: ${ZIP_URL}"

# Download the zip file
echo "Downloading ${ZIP_URL} to ${ZIP_PATH}"
if ! curl -L -o "${ZIP_PATH}" "${ZIP_URL}"; then
    echo "✗ Failed to download zip file"
    exit 1
fi

# Extract the zip file
echo "Extracting ${ZIP_PATH} to ${WASM_DIR}"
if ! unzip -o "${ZIP_PATH}" -d "${WASM_DIR}"; then
    echo "✗ Failed to extract zip file"
    echo "Please install unzip or extract ${ZIP_PATH} manually to ${WASM_DIR}"
    exit 1
fi

# Clean up zip file
rm "${ZIP_PATH}"
echo "✓ Cleaned up zip file"

# Verify all expected files exist
EXTRACTED_TYPES_PATH="${WASM_DIR}/interface.d.ts"

if [[ ! -f "${WASM_PATH}" ]]; then
    echo "✗ slang-wasm.wasm not found in extracted files"
    exit 1
fi

if [[ ! -f "${JS_PATH}" ]]; then
    echo "✗ slang-wasm.js not found in extracted files"
    exit 1
fi

if [[ ! -f "${EXTRACTED_TYPES_PATH}" ]]; then
    echo "✗ interface.d.ts not found in extracted files"
    exit 1
fi

# Move interface.d.ts to replace the existing slang-wasm.d.ts
cp "${EXTRACTED_TYPES_PATH}" "${TYPES_PATH}"
rm "${EXTRACTED_TYPES_PATH}"
echo "✓ Moved interface.d.ts to types/slang-wasm.d.ts"

echo "✓ All slang-wasm files are ready!"
