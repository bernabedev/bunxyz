import { BunxyzRequest, BunxyzResponse } from "bunxyz";

export function GET(req: BunxyzRequest) {
  return BunxyzResponse.json({ message: "Hello from the API!" });
}
