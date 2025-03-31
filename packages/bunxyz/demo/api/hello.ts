import type { BunxyzRequest } from "../request";
import { BunxyzResponse } from "../response";

export const GET = (req: BunxyzRequest): BunxyzResponse => {
  return BunxyzResponse.json({ message: "Hello from the API!" });
};
