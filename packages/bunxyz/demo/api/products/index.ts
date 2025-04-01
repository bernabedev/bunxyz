import type { BunxyzRequest } from "../../../src/request";
import { BunxyzResponse } from "../../../src/response";
import { bodySchema } from "./dto/product.dto";

// Modifying this array directly only works because the server process keeps it in memory.
export let products = [
  { id: "1", name: "Laptop", price: 1200 },
  { id: "2", name: "Keyboard", price: 75 },
  { id: "3", name: "Monitor", price: 300 },
];

export const GET = (req: BunxyzRequest): Response => {
  return BunxyzResponse.json(products);
};

export const POST = async (req: BunxyzRequest): Promise<Response> => {
  const validatedProductData = await req.json(bodySchema);
  const newProduct = { id: Date.now().toString(), ...validatedProductData };
  products.push(newProduct as { id: string; name: string; price: number });
  return BunxyzResponse.json(newProduct);
};
