import { z } from "zod";

export const CreateProductDto = z.object({
  name: z.string().min(2).max(50),
  price: z.number().nonnegative().optional().default(0),
  tags: z.array(z.string()).optional().default([]),
});

export const UpdateProductDto = CreateProductDto.partial();
