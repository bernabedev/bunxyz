# Bunxyz 🚀

A minimalist, fast, file-system based routing framework for **Bun**, inspired by Express and Next.js/Remix. Leverage Bun's incredible speed with a familiar and intuitive development experience.

[![Made with Bun](https://img.shields.io/badge/Made%20with-Bun-yellow.svg)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<!-- Add other badges like version, build status later -->

## Features ✨

- ⚡️ **Blazing Fast:** Built directly on Bun's native `Bun.serve` API.
- 📁 **File-System Routing:** Define your API routes effortlessly using the directory structure under `src/api` (configurable).
- ⚙️ **Dynamic Routes:** Supports parameters like `/api/products/[id].ts`.
- 🧩 **Middleware Support:** Easily add Express-style middleware functions.
- 🔧 **Developer Friendly:** Includes `BunxyzRequest` (with `req.params`) and `BunxyzResponse` helpers (`.json()`, `.text()`, `.html()`).
- ✍️ **Explicit Method Handlers:** Use named exports (`GET`, `POST`, `PUT`, `DELETE`, etc.) in your route files.
