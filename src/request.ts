export class BunxyzRequest extends Request {
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
