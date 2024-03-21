import { addressSchema } from "@argent/x-shared"
import { z } from "zod"

export const apiTokenInfoSchema = z.object({
  id: z.number(),
  address: addressSchema,
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  iconUrl: z.string().optional(),
  sendable: z.boolean(),
  popular: z.boolean(),
  refundable: z.boolean(),
  listed: z.boolean(),
  tradable: z.boolean(),
  category: z.union([
    z.literal("tokens"),
    z.literal("currencies"),
    z.literal("savings"),
  ]),
  pricingId: z.number().optional(),
})

export type ApiTokenInfo = z.infer<typeof apiTokenInfoSchema>

export const apiTokensInfoResponseSchema = z.object({
  tokens: z.array(apiTokenInfoSchema),
})

export type ApiTokensInfoResponse = z.infer<typeof apiTokensInfoResponseSchema>

export const tokenInfoByNetworkSchema = z.record(
  z.string(),
  z.object({ updatedAt: z.number(), data: z.array(apiTokenInfoSchema) }),
)

export type TokenInfoByNetwork = z.infer<typeof tokenInfoByNetworkSchema>
