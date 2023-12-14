import { addressOrDomainInputSchema } from "@argent/shared"
import { z } from "zod"

export const addressBookContactSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, { message: "Contact Name is required" }),
  networkId: z
    .string()
    .trim()
    .min(1, { message: "Contact Network is required" }),
  address: z
    .string()
    .trim()
    .min(1, { message: "Address is required" })
    .pipe(addressOrDomainInputSchema),
})

export const addressBookContactNoIdSchema = addressBookContactSchema.omit({
  id: true,
})
