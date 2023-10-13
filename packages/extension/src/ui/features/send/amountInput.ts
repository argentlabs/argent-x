import { z } from "zod"

export const amountInputSchema = z
  .string()
  .regex(/^[0-9]*\.?[0-9]{0,18}$/g, "Invalid amount character")
  .refine((value) => {
    /** extra simple checks to avoid even nastier RegEx */
    return !value.startsWith("00")
  }, "Amount cannot have more than one leading zero")
