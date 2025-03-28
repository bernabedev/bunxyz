import type { BunFile } from "bun";
import { z } from "zod";

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

  static validationError(
    errors: z.ZodError<any>,
    init?: ResponseInit
  ): Response {
    const formattedErrors = errors.flatten();
    return BunxyzResponse.json(
      {
        error: "Validation Failed",
        details: formattedErrors.fieldErrors,
        formErrors: formattedErrors.formErrors,
      },
      { status: 400, ...init }
    );
  }
}
