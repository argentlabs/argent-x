import { addressOrDomainSchema, addressSchema } from "@argent/x-shared"
import { z } from "zod"

export const sendQuerySchema = z.object({
  recipientAddress: addressOrDomainSchema.optional(),
  tokenAddress: addressSchema,
  tokenId: z.string().optional(),
  amount: z.string().optional(),
  returnTo: z.string().optional(),
})

export type SendQuery = z.infer<typeof sendQuerySchema>

export const isSendQuery = (query: any): query is SendQuery => {
  return sendQuerySchema.safeParse(query).success
}
