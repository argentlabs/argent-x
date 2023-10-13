import { z } from "zod"

export const bigNumberSchema = z
  .any()
  .refine((value) => typeof value === "bigint", {
    message: "Value must be a BigInt",
  })
  .transform((value) => BigInt(value))
