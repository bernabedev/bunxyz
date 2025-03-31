# 🦊 Bunxyz Monorepo

A minimalist, fast, file-system based routing framework for **Bun**, inspired by Express and Next.js/Remix. Leverage Bun's incredible speed with a familiar and intuitive development experience.

[![Made with Bun](https://img.shields.io/badge/Made%20with-Bun-yellow.svg)](https://bun.sh)
[![Build Status](https://img.shields.io/github/actions/workflow/status/bernabedev/bunxyz/ci.yml?branch=main)](https://github.com/bernabedev/bunxyz/actions)
[![NPM Version - Framework](https://img.shields.io/npm/v/bunxyz.svg)](https://www.npmjs.com/package/bunxyz) <!-- Placeholder -->
[![NPM Version - CLI](https://img.shields.io/npm/v/@bunxyz/cli.svg)](https://www.npmjs.com/package/@bunxyz/cli) <!-- Placeholder -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Adjust if needed -->

This repository contains the source code for the **Bunxyz framework** and its command-line interface (**Bunxyz CLI**). Bunxyz aims to be a fast, lightweight, and developer-friendly web framework built specifically for the [Bun](https://bun.sh/) runtime.

This is a monorepo managed using **Bun Workspaces**.

## Monorepo Structure

The repository is organized as follows:

bunxyz/
├── packages/ # Contains all individual packages
│ ├── bunxyz/ # The core Bunxyz framework library
│ └── bunxyz-cli/ # The Bunxyz command-line interface tool
├── docs/ # Documentation (Optional)
├── .gitignore # Git ignore rules for the entire repo
├── package.json # Root package.json defining workspaces and common dev dependencies
├── tsconfig.base.json # Base TypeScript configuration (Optional)
├── README.md # This file
└── bun.lockb # Bun lockfile

## Packages

- **`packages/bunxyz`**: The core framework package. It exports the main `App` class, `BunxyzRequest`, `BunxyzResponse`, type definitions, and other core functionalities.
- **`packages/bunxyz-cli`**: The CLI tool, published as `@bunxyz/cli` (or your chosen name). Provides the `bunxyz` command for scaffolding new projects (`bunxyz create <project-name>`) and potentially other development tasks in the future.

## Getting Started (Development)

To set up the monorepo for local development:

1.  **Prerequisites:**

    - [Bun](https://bun.sh/docs/installation) (v1.x or later recommended)
    - Git

2.  **Clone the repository:**

    ```bash
    git clone https://github.com/bernabedev/bunxyz.git
    cd bunxyz
    ```

3.  **Install dependencies:**
    This command installs dependencies for _all_ packages within the workspace and links local packages together (e.g., `bunxyz-cli` will use the local `bunxyz` package).
    ```bash
    bun install
    ```

## Development Workflow & Scripts

Common development tasks can be run from the **root** of the monorepo:

- **Build all packages:**

  ```bash
  bun run build
  ```

  _(This executes the `build` script defined in each package's `package.json`)_

- **Build a specific package:**

  ```bash
  # Build only the framework
  bun run build:framework
  # Or using filter
  bun run --filter bunxyz build

  # Build only the CLI
  bun run build:cli
  # Or using filter
  bun run --filter bunxyz-cli build
  ```

- **Clean build artifacts and dependencies:**

  ```bash
  bun run clean
  ```

- **(Add scripts for testing, linting, formatting etc. to the root `package.json` as needed)**
  ```bash
  # Example placeholders
  bun run test
  bun run lint
  bun run format
  ```

## Using the CLI Locally During Development

To test the `bunxyz-cli` package while developing it:

1.  **Build the CLI:** Make sure you have compiled the CLI code.

    ```bash
    bun run build:cli
    ```

2.  **Link the CLI globally:** Navigate to the CLI package directory and use `bun link`.

    ```bash
    cd packages/bunxyz-cli
    bun link
    cd ../.. # Go back to the monorepo root or another directory
    ```

3.  **Use the linked CLI:** Now you can use the `bunxyz` command globally, and it will point to your local build.

    ```bash
    # Create a test project OUTSIDE the monorepo structure
    cd /path/to/your/test/area
    bunxyz create my-test-project
    ```

    - **Note:** Changes made to the **CLI source code** (`packages/bunxyz-cli/src`) require rebuilding (`bun run build:cli`) for the linked command to reflect them.
    - **Note:** Changes made to the **framework source code** (`packages/bunxyz/src`) should be reflected automatically when you run the CLI or a test project (due to workspace linking), although you might need to restart any running processes (like a dev server).

## Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` (you'll need to create this file) for guidelines on reporting issues, submitting pull requests, and the development process.

## License

This project is licensed under the MIT License - see the `LICENSE` file (you'll need to create this file) for details.
