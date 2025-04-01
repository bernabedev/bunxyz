import type { ZodSchema } from "zod";
import { RequestValidationError } from "./errors";

export class BunxyzRequest extends Request {
  params: Record<string, string> = {};
  query: Record<string, string | string[]> = {};
  validatedData?: {
    params?: any;
    query?: any;
    body?: any;
  };

  constructor(
    input: Request,
    params: Record<string, string> = {},
    query: Record<string, string | string[]> = {}
  ) {
    super(input);
    this.params = params;
    this.query = query;
  }

  /**
   * Parses the request body as JSON and optionally validates it against a Zod schema.
   * @param schema Optional ZodSchema to validate the parsed body.
   * @returns A promise that resolves with the parsed (and potentially validated) body.
   * @throws {RequestValidationError} If validation fails.
   * @throws {SyntaxError} If the body is not valid JSON.
   */
  async json<T>(schema?: ZodSchema<T>): Promise<T> {
    let parsedBody: any;
    try {
      // Clone the request so we can read the body potentially multiple times
      // or for other framework parts (like middleware) to read it as well.
      parsedBody = await this.clone().json();
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        console.warn(
          "[Request Error] Invalid JSON format received.",
          error.message
        );
        // Re-throw the error to be handled by the global error handler
        // or by a try/catch in the route handler.
        throw new Error("Invalid JSON format in request body"); // Or you could throw a more specific error
      }
      console.error(
        "[Request Error] Unexpected error parsing JSON body:",
        error
      );
      throw error; // Re-throw other unexpected errors
    }

    if (schema) {
      const result = schema.safeParse(parsedBody);
      if (!result.success) {
        // Throw the custom error to be caught by the error handler
        throw new RequestValidationError(result.error);
      }
      // Return validated and potentially Zod-transformed data
      return result.data;
    }

    // If no schema was provided, return the parsed body as-is
    // The type T here is caller's expectation, not guaranteed without schema.
    return parsedBody as T;
  }

  async text(): Promise<string> {
    return await super.text();
  }
}
