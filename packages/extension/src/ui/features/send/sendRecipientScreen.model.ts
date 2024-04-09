import { z } from "zod"
import { addressOrDomainInputSchema } from "@argent/x-shared"

export const formSchema = z.object({
  query: addressOrDomainInputSchema,
})

export type FormType = z.infer<typeof formSchema>
