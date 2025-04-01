import { ZodError } from "zod";

export class RequestValidationError extends Error {
  public readonly issues: ZodError["issues"];
  public readonly statusCode: number;

  constructor(zodError: ZodError) {
    super(
      `Request validation failed: ${zodError.errors
        .map((e) => e.message)
        .join(", ")}`
    );
    this.name = "RequestValidationError";
    this.issues = zodError.issues; // Save Zod error details
    this.statusCode = 400; // Appropriate HTTP status code
    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RequestValidationError);
    }
  }

  // Method to format like BunxyzResponse.validationError response
  flatten() {
    return new ZodError(this.issues).flatten();
  }
}
