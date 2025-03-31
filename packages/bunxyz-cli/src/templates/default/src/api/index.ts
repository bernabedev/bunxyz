import { BunxyzRequest, BunxyzResponse } from "bunxyz";
import { z } from "zod";

export const querySchema = z.object({
  name: z.string().optional().default("World"),
});

export function GET(req: BunxyzRequest) {
  const { name } = req.validatedData?.query ?? { name: "World" };

  return BunxyzResponse.json({ message: `Hello ${name} from the API!` });
}
