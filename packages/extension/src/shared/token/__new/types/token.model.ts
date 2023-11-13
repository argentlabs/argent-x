import { addressSchema } from "@argent/shared"
import { z } from "zod"

export const BaseTokenSchema = z.object(
  {
    address: addressSchema,
    networkId: z.string({ required_error: "Network is required" }),
  },
  { required_error: "BaseToken is required" },
)

export type BaseToken = z.infer<typeof BaseTokenSchema>

export const RequestTokenSchema = z.object({
  address: addressSchema,
  networkId: z.string().optional(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.coerce.number().optional(),
})

export type RequestToken = z.infer<typeof RequestTokenSchema>

export const TokenSchema = RequestTokenSchema.required().extend({
  id: z.number().optional(),
  iconUrl: z.string().optional(),
  showAlways: z.boolean().optional(),
  popular: z.boolean().optional(),
  custom: z.boolean().optional(),
  pricingId: z.number().optional(),
})

export type Token = z.infer<typeof TokenSchema>

export const ApiTokenDetailsSchema = z.object({
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
  category: z.union([z.literal("tokens"), z.literal("currencies")]),
  pricingId: z.number().optional(),
})

export type ApiTokenDetails = z.infer<typeof ApiTokenDetailsSchema>
export const ApiTokenDataResponseSchema = z.object({
  tokens: z.array(ApiTokenDetailsSchema),
})
export type ApiTokenDataResponse = z.infer<typeof ApiTokenDataResponseSchema>
