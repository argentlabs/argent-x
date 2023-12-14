import { z } from "zod"
import { addressOrDomainInputSchema } from "@argent/shared"

export const formSchema = z.object({
  query: addressOrDomainInputSchema,
})

export type FormType = z.infer<typeof formSchema>
