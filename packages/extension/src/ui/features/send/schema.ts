import { addressOrStarknetIdSchema, addressSchema } from "@argent/shared"
import { z } from "zod"

import { useQuery } from "../../hooks/useQuery"

export const sendQuerySchema = z.object({
  recipientAddress: addressOrStarknetIdSchema.optional(),
  tokenAddress: addressSchema.optional(),
  tokenId: z.string().optional(),
  amount: z.string().optional(),
  returnTo: z.string().optional(),
})

export type SendQuery = z.infer<typeof sendQuerySchema>

export const isSendQuery = (query: any): query is SendQuery => {
  return sendQuerySchema.safeParse(query).success
}

/** TODO: refactor - make into a generic helper */

export const parseQuery = <T extends z.ZodSchema>(
  query: URLSearchParams,
  schema: T,
): z.output<T> => {
  const unknownValues: Record<string, string> = {}
  for (const [key, value] of query.entries()) {
    unknownValues[key] = value
  }
  const result = schema.safeParse(unknownValues)
  return result.success ? result.data : {}
}

export const useSendQuery = () => {
  const query = useQuery()
  return parseQuery(query, sendQuerySchema)
}
