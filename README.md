# compute.toys

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/compute-toys/compute.toys?quickstart=1)

**[compute.toys](https://compute.toys)** is a WebGPU-based compute shader playground that lets you write, compile, and run compute shaders directly in the browser.
It uses the [Slang shading language](https://shader-slang.org/), which gets transpiled to WGSL and executed on your GPU via WebGPU.

## Architecture

- **Frontend**: Next.js with React, Material-UI, and Monaco Editor
- **Deployment**: Cloudflare Workers (via OpenNext)
- **Database**: Supabase (PostgreSQL) with real-time features
- **Shader Compilation**: Slang compiler running as WebAssembly
- **Graphics**: WebGPU for compute shader execution and rendering

## Development

To install dependencies:

- make sure you've cloned submodules: `git submodule update --init --recursive`
- run [`yarn`](https://yarnpkg.com/getting-started/install)

To start the development server, run `yarn dev`, or use the debug configuration in VS Code.

Some other useful commands are:

- `yarn build` to check everything builds properly (the CI will check this for PRs)
- `yarn lint` to only check for lint errors and warnings
- `yarn fix` to automatically fix lint errors where possible

## Local Database

Run `npx supabase start` to start a local instance of the compute.toys database.
Copy the "anon key" from the output and set it as `NEXT_PUBLIC_SUPABASE_PUBLIC_API_KEY` in the `.env` file.
You'll also need to set `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`

If you're using codespaces, you can instead set the URL to the forwarded port, it'll need to have public visibility.
You should also set `api_url` in `supabase/config.toml` to the same address.

A local test user is available to login with username `user@example.com` and password `pass`

---

This project is tested with BrowserStack
