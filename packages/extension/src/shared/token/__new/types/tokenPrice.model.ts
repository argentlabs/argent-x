import { z } from "zod"
import { BaseTokenSchema, TokenSchema } from "./token.model"
import {
  BaseTokenWithBalanceSchema,
  TokenWithBigIntBalanceSchema,
} from "./tokenBalance.model"
import { apiPriceDetailsSchema } from "@argent/x-shared"

export const TokenWithPriceSchema = TokenSchema.extend({
  usdValue: z.string(),
})

export type TokenWithPrice = z.infer<typeof TokenWithPriceSchema>

export const TokenWithBalanceAndPriceSchema = TokenWithPriceSchema.extend({
  ...BaseTokenWithBalanceSchema.shape,
  ...TokenWithBigIntBalanceSchema.shape,
})

export type TokenWithBalanceAndPrice = z.infer<
  typeof TokenWithBalanceAndPriceSchema
>

export const TokenPriceDetailsSchema = BaseTokenSchema.extend({
  ...apiPriceDetailsSchema.shape,
})

export type TokenPriceDetails = z.infer<typeof TokenPriceDetailsSchema>
