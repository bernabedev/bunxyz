import type { BunxyzRequest } from "../../src/request";
import { BunxyzResponse } from "../../src/response";

export const GET = (req: BunxyzRequest): BunxyzResponse => {
  return BunxyzResponse.json({ message: "Hello from the API!" });
};
