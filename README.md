# compute.toys

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/compute-toys/compute.toys?quickstart=1)

This is the source code of the [compute.toys](https://compute.toys) website.

## Development

Make sure you install these tools:

- [Yarn](https://yarnpkg.com/getting-started/install)
- [Rust](https://www.rust-lang.org/tools/install)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

To install dependencies:

- make sure you've cloned submodules: `git submodule update --init --recursive`
- run `yarn`

To start the development server, run `yarn dev`, or use the debug configuration in VS Code.

Some other useful commands are:

- `yarn build` to check everything builds properly (the CI will check this for PRs)
- `yarn lint` to only check for lint errors and warnings
- `yarn fix` to automatically fix lint errors where possible

## Standalone Editor

By default, the development environment will connect to the public API for the compute.toys website.
If you'd prefer to develop just the editor component, without any of the account-based sharing features,
delete the `pages` directory before starting the server.

If you have any difficulties with Next.js switching between the two configurations,
clear the cache by deleting the `.next` directory and try again.
