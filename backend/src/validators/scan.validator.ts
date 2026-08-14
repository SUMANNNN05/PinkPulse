import { z } from "zod";

export const scanIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid scan id"),
  }),
});
