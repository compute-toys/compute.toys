# compute.toys

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/compute-toys/compute.toys?quickstart=1)

This is the source code of the [compute.toys](https://compute.toys) website.

## Development

Install dependencies and run dev server. You can read [Architecture Wiki](https://deepwiki.com/compute-toys/compute.toys/3-architecture-overview). We using WebGPU [/lib/engine](https://deepwiki.com/compute-toys/compute.toys/4.1-webgpu-engine) written in Typescript that previously [was in Rust](https://github.com/compute-toys/wgpu-compute-toy), Monaco editor as a code linter, Supabase for database, Jotai for state manager and Slang for shader compiler. Use this yarn commands in console:

- `yarn` to install dependencies
- `yarn dev` to start the development server
- `yarn build` to check everything builds properly (the CI will check this for PRs)
- `yarn lint` to only check for lint errors and warnings
- `yarn fix` to automatically fix lint errors where possible

You can check latest dev version online [staging.compute.toys](https://staging.compute.toys/).

## Local Database

Run `npx supabase start` to start a local instance of the compute.toys database.
Copy the "anon key" from the output and set it as `NEXT_PUBLIC_SUPABASE_PUBLIC_API_KEY` in the `.env` file.
You'll also need to set `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`

If you're using codespaces, you can instead set the URL to the forwarded port, it'll need to have public visibility.
You should also set `api_url` in `supabase/config.toml` to the same address.

A local test user is available to login with username `user@example.com` and password `pass`

---

This project is tested with BrowserStack
