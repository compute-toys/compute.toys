# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Setup:**
- `git submodule update --init --recursive` - Clone submodules (required for dependencies)
- `yarn` - Install dependencies
- `npx supabase start` - Start local database

**Core Development:**
- `yarn dev` - Start development server
- `yarn build` - Build for production (required for CI/CD)
- `yarn lint` - Check for lint errors/warnings  
- `yarn fix` - Auto-fix lint errors

**Specialized Commands:**
- `yarn preview` - Build and preview with OpenNext Cloudflare (Workers deployment)
- `yarn download-wasm` - Download Slang WASM files (auto-runs in prebuild)
- `yarn download-wasm:force` - Force re-download WASM files
- `yarn cf-typegen` - Generate Cloudflare Worker types
- `yarn supabase:types` - Generate database types from local Supabase
- `yarn supabase:reset` - Reset local database

**Environment Setup:**
Set these in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` (local development)
- `NEXT_PUBLIC_SUPABASE_PUBLIC_API_KEY=<anon key from supabase start output>`
- Test user: `user@example.com` / `pass`

## Architecture Overview

**compute.toys** is a WebGPU-based compute shader playground that compiles Slang shaders to WGSL and runs them in the browser.

### Core Technology Stack
- **Frontend**: Next.js 15.4+ with React 18, deployed to Cloudflare Workers via OpenNext
- **Styling**: Material-UI (MUI) with Emotion, custom Monaco Editor theme
- **State**: Jotai for client-side state management
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Shader Compilation**: Slang compiler via WebAssembly, outputs WGSL for WebGPU
- **Deployment**: Cloudflare Workers (migrated from Pages), with R2 for incremental caching

### Key Components

**WebGPU Engine (`lib/engine/`):**
- `ComputeEngine` - Singleton managing WebGPU device, pipeline creation, and rendering
- `Bindings` - Manages GPU buffers, textures, and binding groups
- `Blitter` - Handles texture blitting and mipmap generation
- Supports multi-pass compute shaders with storage buffers and custom uniforms

**Shader Compilation (`lib/slang/`):**
- `Compiler` - WebAssembly wrapper for Slang compiler, transpiles to WGSL
- `BindingParser` - Extracts binding information from shader reflection
- Language server integration for Monaco Editor (syntax highlighting, diagnostics)

**Editor Interface (`components/editor/`):**
- Monaco Editor with custom Slang grammar and WGSL support
- Real-time compilation and error reporting with source mapping
- Texture picker, uniform sliders, buffer controls
- Vim mode support, configurable themes

### Data Flow
1. User edits Slang shader in Monaco Editor
2. Slang compiler (WASM) transpiles to WGSL
3. WebGPU creates compute pipeline from WGSL
4. Engine dispatches compute workgroups, renders to canvas
5. Results stored in Supabase with user authentication

### File Structure Patterns
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (buttons, editor, global UI)
- `lib/` - Core business logic (engine, compilation, utilities)
- `types/` - TypeScript definitions, auto-generated database types
- `public/wasm/` - Slang compiler WebAssembly files
- `supabase/` - Database migrations and configuration

## Important Configuration Notes

### Cloudflare Workers Deployment
- Requires `enable_nodejs_http_modules` compatibility flag for HTTP polyfills
- OpenNext handles Next.js -> Workers transpilation automatically
- Cloudflare types (`types/cloudflare-env.d.ts`) excluded from main tsconfig to prevent WebAssembly type conflicts

### TypeScript Configuration
- Uses "bundler" module resolution for OpenNext compatibility  
- Custom shader file extensions (`.slang`, `.wgsl`) loaded as text via webpack
- WebGPU types from `@webgpu/types`, Emscripten types for WASM integration

### WebAssembly Integration
- Slang compiler loaded as uncompressed WASM (`slang-wasm.wasm`)
- Cloudflare Workers automatically handles compression for static assets
- WASM files served from `/public/wasm/` directory

### Development Environment
- Local Supabase required for database functionality
- WebGPU requires Chrome/Edge with appropriate flags enabled
- Hot reload and dev tools integrated with custom engine lifecycle