import type { BunxyzRequest } from "../../request";
import { BunxyzResponse } from "../../response";

// Modifying this array directly only works because the server process keeps it in memory.
export let products = [
  { id: "1", name: "Laptop", price: 1200 },
  { id: "2", name: "Keyboard", price: 75 },
  { id: "3", name: "Monitor", price: 300 },
];

export const GET = (req: BunxyzRequest): Response => {
  return BunxyzResponse.json(products);
};
