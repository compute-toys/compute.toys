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

**Note:** Currently you won't be able to run the full website without the database keys.
As a workaround, delete the `pages` directory, and it will fallback to a standalone editor
(similar to https://compute.toys/new without the account-based features).
