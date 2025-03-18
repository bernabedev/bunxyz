import { serve, type Server } from "bun";
import { BunxyzRequest } from "./request";
import { BunxyzResponse } from "./response";

type Handler = (req: Request) => Response | Promise<Response>;
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

  constructor(port?: number) {
    if (port) {
      this.port = port;
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
