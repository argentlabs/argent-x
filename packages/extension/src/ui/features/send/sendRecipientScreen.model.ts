import { z } from "zod"
import { addressOrStarknetIdInputSchema } from "@argent/shared"

export const formSchema = z.object({
  query: addressOrStarknetIdInputSchema,
})

export type FormType = z.infer<typeof formSchema>
