import { serve, type Server } from "bun";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { ZodSchema } from "zod";
import { BunxyzRequest } from "./request";
import { BunxyzResponse } from "./response";

export type Handler = (req: BunxyzRequest) => Response | Promise<Response>;

export type Middleware = (
  req: BunxyzRequest,
  next: () => Promise<Response>
) => Promise<Response> | Response;

interface RouteDefinition {
  method: string;
  path: string; // Original path string (e.g., /api/users/:id)
  regex: RegExp; // Compiled regex for matching
  paramNames: string[]; // Names of parameters extracted from the path
  handler: Handler;
  // Validation schemas (optional)
  paramsSchema?: ZodSchema<any>;
  querySchema?: ZodSchema<any>;
  bodySchema?: ZodSchema<any>;
}

export class App {
  private routes: RouteDefinition[] = [];
  private middleware: Middleware[] = [];
  private server: Server | null = null;
  private port: number = 3000;
  private apiDir: string;

  constructor(port?: number, apiDir?: string) {
    if (port) {
      this.port = port;
    }
    this.apiDir = apiDir ?? path.join(process.cwd(), "src", "api");

    this.loadApiRoutes().catch((err) => {
      console.error("Failed to load API routes during initialization:", err);
    });
  }

  use(middleware: Middleware): void {
    this.middleware.push(middleware);
  }

  get(path: string, handler: Handler): void {
    this.addRoute("GET", path, handler);
  }

  post(path: string, handler: Handler): void {
    this.addRoute("POST", path, handler);
  }

  put(path: string, handler: Handler): void {
    this.addRoute("PUT", path, handler);
  }

  delete(path: string, handler: Handler): void {
    this.addRoute("DELETE", path, handler);
  }

  private compilePath(path: string): { regex: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];

    const regexPath =
      "^" +
      path.replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      }) +
      "/?$";
    const regex = new RegExp(regexPath);
    return { regex, paramNames };
  }

  private addRoute(
    method: string,
    path: string,
    handler: Handler,
    schemas?: {
      paramsSchema?: ZodSchema<any>;
      querySchema?: ZodSchema<any>;
      bodySchema?: ZodSchema<any>;
    }
  ): void {
    const { regex, paramNames } = this.compilePath(path);
    this.routes.push({
      method: method.toUpperCase(),
      path,
      regex,
      paramNames,
      handler,

      // Validation schemas (optional)
      paramsSchema: schemas?.paramsSchema,
      querySchema: schemas?.querySchema,
      bodySchema: schemas?.bodySchema,
    });
    console.log(`Registered route: ${method} ${path}`);
  }

  // private findRoute(method: string, path: string): Route | undefined {
  //   return this.routes.find(
  //     (route) => route.method === method && route.path === path
  //   );
  // }

  private async loadApiRoutes(
    dir: string = this.apiDir,
    prefix: string = "/api"
  ): Promise<void> {
    try {
      try {
        await stat(dir);
      } catch (e: any) {
        if (e.code === "ENOENT") {
          console.warn(
            `API directory not found: ${dir}. Skipping route loading.`
          );
          return;
        }
        throw e;
      }

      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const folderSegment = entry.name.replace(/^\[(.*?)\]$/, ":$1");
          await this.loadApiRoutes(fullPath, `${prefix}/${folderSegment}`);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))
        ) {
          const routeSegment = entry.name.replace(/\.[tj]s$/, "");
          const finalSegment =
            routeSegment === "index" ? "" : `/${routeSegment}`;

          const routePath = `${prefix}${finalSegment}`.replace(
            /\[(.*?)\]/g,
            ":$1"
          );

          const normalizedPath = routePath.replace(/\/+/g, "/");
          const finalPath = normalizedPath === "" ? "/" : normalizedPath;

          try {
            const module = await import(fullPath);

            const schemas = {
              paramsSchema:
                module.paramsSchema instanceof ZodSchema
                  ? module.paramsSchema
                  : undefined,
              querySchema:
                module.querySchema instanceof ZodSchema
                  ? module.querySchema
                  : undefined,
              bodySchema:
                module.bodySchema instanceof ZodSchema
                  ? module.bodySchema
                  : undefined,
            };

            for (const method of [
              "GET",
              "POST",
              "PUT",
              "DELETE",
              "PATCH",
              "OPTIONS",
              "HEAD",
            ]) {
              if (typeof module[method] === "function") {
                this.addRoute(method, finalPath, module[method], schemas);
              }
            }
          } catch (importError) {
            console.error(
              `Error importing route module ${fullPath}:`,
              importError
            );
          }
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
        console.error(`Error scanning API directory ${dir}:`, error);
      }
    }
  }

  private async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();
    const pathname = url.pathname;

    const query: Record<string, string | string[]> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (query[key]) {
        // If key already exists, convert to array or push
        if (Array.isArray(query[key])) {
          (query[key] as string[]).push(value);
        } else {
          query[key] = [query[key] as string, value];
        }
      } else {
        query[key] = value;
      }
    }

    for (const route of this.routes) {
      if (route.method !== method) {
        continue;
      }

      const match = route.regex.exec(pathname);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        let validatedParams: any = params;
        if (route.paramsSchema) {
          const result = route.paramsSchema.safeParse(params);
          if (!result.success) {
            console.warn(
              `[Validation Error] Params validation failed for ${method} ${pathname}:`,
              result.error.flatten()
            );
            return BunxyzResponse.validationError(result.error);
          }
          validatedParams = result.data;
        }

        let validatedQuery: any = query;
        if (route.querySchema) {
          const result = route.querySchema.safeParse(query);
          if (!result.success) {
            console.warn(
              `[Validation Error] Query validation failed for ${method} ${pathname}:`,
              result.error.flatten()
            );
            return BunxyzResponse.validationError(result.error);
          }
          validatedQuery = result.data;
        }

        const customReq = new BunxyzRequest(
          req,
          validatedParams,
          validatedQuery
        );
        customReq.validatedData = {
          params: validatedParams,
          query: validatedQuery,
        };

        const executeHandler = async (): Promise<Response> => {
          let parsedBody: any = undefined;

          if (route.bodySchema && !["GET", "HEAD"].includes(method)) {
            try {
              const contentType = req.headers
                .get("content-type")
                ?.split(";")[0];
              if (contentType === "application/json") {
                parsedBody = await req.clone().json();
              } else {
                console.warn(
                  `[Validation] Body validation skipped for ${method} ${pathname}: Unsupported Content-Type '${contentType}'. Only 'application/json' is supported.`
                );
              }

              if (parsedBody !== undefined) {
                const result = route.bodySchema.safeParse(parsedBody);
                if (!result.success) {
                  console.warn(
                    `[Validation Error] Body validation failed for ${method} ${pathname}:`,
                    result.error.flatten()
                  );
                  return BunxyzResponse.validationError(result.error);
                }

                customReq.validatedData = {
                  ...customReq.validatedData,
                  body: result.data,
                };
              }
            } catch (error: any) {
              if (error instanceof SyntaxError) {
                console.warn(
                  `[Validation Error] Invalid JSON body for ${method} ${pathname}:`,
                  error.message
                );
                return BunxyzResponse.json(
                  { error: "Invalid JSON format in request body" },
                  { status: 400 }
                );
              }

              console.error(
                `[Validation Error] Unexpected error during body parsing/validation for ${method} ${pathname}:`,
                error
              );
              return BunxyzResponse.json(
                { error: "Error processing request body" },
                { status: 500 }
              );
            }
          }

          return Promise.resolve(route.handler(customReq));
        };

        const runMiddleware = (index: number): Promise<Response> => {
          if (index < this.middleware.length) {
            const currentMiddleware = this.middleware[index];

            return Promise.resolve(
              currentMiddleware(customReq, () => runMiddleware(index + 1))
            );
          } else {
            return executeHandler();
          }
        };

        try {
          return await runMiddleware(0);
        } catch (error: any) {
          console.error(`Error handling request ${method} ${pathname}:`, error);

          return BunxyzResponse.json(
            {
              error: "Internal Server Error",
              message: error?.message ?? "Unknown error",
            },
            { status: 500 }
          );
        }
      }
    }
    return BunxyzResponse.json({ error: "Not Found" }, { status: 404 });
  }

  listen(callback?: (port: number) => void): void {
    if (this.server) {
      console.warn("Server is already running.");
      return;
    }

    console.log("Starting server...");
    // Wait for the routes to load if the promise has not yet been resolved (this is a bit simplistic)
    // Ideally, `listen` should be async or wait for `loadApiRoutes` to finish.
    // For simplicity, we assume the loading is quick or has already finished.

    // Print the registered routes right before starting the server
    // console.log(
    //   "Registered routes:",
    //   this.routes.map((r) => `${r.method} ${r.path}`)
    // );

    this.server = serve({
      port: this.port,
      // Use handleRequest as the main fetch handler
      fetch: this.handleRequest.bind(this),
      // Add a basic error handler at the server level
      error(error: Error): Response | Promise<Response> {
        console.error("Unhandled server error:", error);
        return BunxyzResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      },
    });

    if (callback) {
      callback(this.port);
    } else {
      console.log(`Server listening on http://localhost:${this.port}`);
    }
  }

  stop(): void {
    if (this.server) {
      this.server.stop(true); // true to forcibly close existing connections
      this.server = null;
      console.log("Server stopped.");
    }
  }
}
