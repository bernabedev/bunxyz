export class BunxyzRequest extends Request {
  params: Record<string, string> = {};

  constructor(input: Request, params: Record<string, string> = {}) {
    super(input);
    this.params = params;
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
