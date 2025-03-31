import { z } from "zod";
import type { BunxyzRequest } from "../../../src/request";
import { BunxyzResponse } from "../../../src/response";

// Modifying this array directly only works because the server process keeps it in memory.
export let products = [
  { id: "1", name: "Laptop", price: 1200 },
  { id: "2", name: "Keyboard", price: 75 },
  { id: "3", name: "Monitor", price: 300 },
];

export const GET = (req: BunxyzRequest): Response => {
  return BunxyzResponse.json(products);
};

export const bodySchema = z.object({
  name: z.string().min(2).max(50),
  price: z.number().nonnegative().optional().default(0),
  tags: z.array(z.string()).optional().default([]),
});

export const POST = (req: BunxyzRequest): Response => {
  const body = req.validatedData?.body as z.infer<typeof bodySchema>;
  console.log({ body });
  const newProduct = { id: Date.now().toString(), ...body };
  products.push(newProduct);
  return BunxyzResponse.json(newProduct);
};
