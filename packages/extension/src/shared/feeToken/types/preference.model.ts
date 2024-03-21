import { z } from "zod"
import { addressSchema } from "@argent/x-shared"

export const FeeTokenPreferenceSchema = z.object({
  prefer: addressSchema,
})

export type FeeTokenPreference = z.infer<typeof FeeTokenPreferenceSchema>

export const FeeTokenPreferenceOptionSchema = z.object({
  avoid: z.array(addressSchema).optional(),
  prefer: z.array(addressSchema).optional(),
})

export type FeeTokenPreferenceOption = z.infer<
  typeof FeeTokenPreferenceOptionSchema
>
