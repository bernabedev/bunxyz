import type { BunFile } from "bun";

export class BunxyzResponse {
  static json(data: any, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify(data), { ...init, headers });
  }

  static text(data: string, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "text/plain");
    return new Response(data, { ...init, headers });
  }

  static html(data: string | BunFile, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "text/html");
    return new Response(data, { ...init, headers });
  }
}
