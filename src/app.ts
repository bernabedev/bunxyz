import { serve, type Server } from "bun";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { BunxyzRequest } from "./request";
import { BunxyzResponse } from "./response";

type Handler = (req: BunxyzRequest) => BunxyzResponse | Promise<BunxyzResponse>;
type Middleware = (
  req: BunxyzRequest,
  res: BunxyzResponse,
  next: () => Promise<BunxyzResponse>
) => Promise<BunxyzResponse> | BunxyzResponse;

interface Route {
  method: string;
  path: string;
  handler: Handler;
}

export class App {
  private routes: Route[] = [];
  private middleware: Middleware[] = [];
  private server: Server | null = null;
  private port: number = 3000;
  private apiDir: string = path.join(process.cwd(), "src", "api"); // Default API directory

  constructor(port?: number, apiDir?: string) {
    if (port) {
      this.port = port;
    }
    if (apiDir) {
      this.apiDir = apiDir;
    } else {
      this.loadApiRoutes(); // Automatically load API routes on initialization
    }
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

  private addRoute(method: string, path: string, handler: Handler): void {
    this.routes.push({ method, path, handler });
  }

  private findRoute(method: string, path: string): Route | undefined {
    return this.routes.find(
      (route) => route.method === method && route.path === path
    );
  }

  private async loadApiRoutes(
    dir: string = this.apiDir,
    prefix: string = "/api"
  ): Promise<void> {
    try {
      const entries = await readdir(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          await this.loadApiRoutes(fullPath, `${prefix}/${entry}`);
        } else if (
          stats.isFile() &&
          (entry.endsWith(".ts") || entry.endsWith(".js"))
        ) {
          const routePath = `${prefix}/${entry.replace(
            /\.[tj]s$/,
            ""
          )}`.replace(/\[(.*?)\]/g, ":$1");
          const module = await import(fullPath);

          // Assuming your API route files export handler functions for different methods
          for (const method of ["GET", "POST", "PUT", "DELETE"]) {
            if (module[method.toUpperCase()]) {
              this.addRoute(method, routePath, module[method.toUpperCase()]);
              console.log(`Loaded API route: ${method} ${routePath}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading API routes:", error);
    }
  }

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const method = req.method.toUpperCase();
    const path = url.pathname;
    const customReq = new BunxyzRequest(req);

    const route = this.findRoute(method, path);

    if (route) {
      let index = 0;
      const next = async (): Promise<BunxyzResponse> => {
        if (index < this.middleware.length) {
          const middlewareFunc = this.middleware[index++];
          return await middlewareFunc(customReq, new BunxyzResponse(), next);
        }
        return await route.handler(customReq);
      };

      try {
        return await next();
      } catch (error: any) {
        console.error("Error handling request:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    } else {
      return new Response("Not Found", { status: 404 });
    }
  }

  listen(callback?: (port: number) => void): void {
    this.server = serve({
      port: this.port,
      fetch: this.handleRequest.bind(this),
    });

    if (callback) {
      callback(this.port);
    } else {
      console.log(`Server listening on port ${this.port}`);
    }
  }
}
