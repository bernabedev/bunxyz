export class BunxyzResponse extends Response {
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
}
