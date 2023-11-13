import { z } from "zod"
import { BaseTokenSchema, TokenSchema } from "./token.model"
import { BaseTokenWithBalanceSchema } from "./tokenBalance.model"

export const ApiPriceDetailsSchema = z.object({
  pricingId: z.number(),
  ethValue: z.string(),
  ccyValue: z.string(),
  ethDayChange: z.string(),
  ccyDayChange: z.string(),
})

export const ApiPriceDataResponseSchema = z.object({
  prices: z.array(ApiPriceDetailsSchema),
})

export type ApiPriceDetails = z.infer<typeof ApiPriceDetailsSchema>
export type ApiPriceDataResponse = z.infer<typeof ApiPriceDataResponseSchema>

export const TokenWithPriceSchema = TokenSchema.extend({
  usdValue: z.string(),
})

export type TokenWithPrice = z.infer<typeof TokenWithPriceSchema>

export const TokenWithBalanceAndPriceSchema = TokenWithPriceSchema.extend({
  ...BaseTokenWithBalanceSchema.shape,
})

export type TokenWithBalanceAndPrice = z.infer<
  typeof TokenWithBalanceAndPriceSchema
>

export const TokenPriceDetailsSchema = BaseTokenSchema.extend({
  ...ApiPriceDetailsSchema.shape,
})

export type TokenPriceDetails = z.infer<typeof TokenPriceDetailsSchema>
