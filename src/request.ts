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

  async json<T>(): Promise<T> {
    try {
      return (await super.json()) as T;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw error;
    }
  }

  async text(): Promise<string> {
    return await super.text();
  }
}
