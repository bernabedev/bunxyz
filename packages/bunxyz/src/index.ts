/**
 * Bunxyz Framework Entry Point
 *
 * This file exports the public API of the Bunxyz framework.
 * Users should import necessary components directly from the package name
 * (e.g., `import { App, BunxyzRequest } from 'bunxyz';`).
 */

// --- Core Class ---
// Export the main application class.
export { App } from "./app";

// --- Request & Response ---
// Export the custom request object that handlers receive.
export { BunxyzRequest } from "./request";
// Export the response helper class for creating responses easily.
export { BunxyzResponse } from "./response";

// --- Types ---
// Export the essential types for defining handlers and middleware.
// Adjust the path if these types are defined elsewhere.
export type { Handler, Middleware } from "./app";

export { RequestValidationError } from "./errors";

// Note: Internal types or implementation details like 'RouteDefinition'
// or utility functions used only within the framework are NOT exported here
// to keep the public API clean and stable.
