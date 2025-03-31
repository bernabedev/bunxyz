# 🦊 Bunxyz CLI

[![NPM Version](https://img.shields.io/npm/v/bunxyz-cli.svg)](https://www.npmjs.com/package/bunxyz-cli) <!-- Replace bunxyz-cli if needed -->
[![Build Status](https://img.shields.io/github/actions/workflow/status/bernabedev/bunxyz/ci.yml?branch=main)](https://github.com/bernabedev/bunxyz/actions) <!-- Link to monorepo status -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE) <!-- Link to root LICENSE -->

This package provides the command-line interface (CLI) for the [Bunxyz Framework](https://github.com/bernabedev/bunxyz). It helps you scaffold new projects and manage your Bunxyz applications.

This CLI is part of the main [Bunxyz Monorepo](../../README.md).

## Installation

You can install the Bunxyz CLI globally using npm or bun:

```bash
bun add -g bunxyz-cli
```

Or using npm:

```bash
npm install -g bunxyz-cli
```

Replace `bunxyz-cli` with the correct package name if you used a different one (e.g., without a scope).

## Usage

### Creating a new project

```bash
bunxyz create <project-name>
```

### Managing your project

```bash
bunxyz <command>
```

### Available commands

- `create`: Create a new project
