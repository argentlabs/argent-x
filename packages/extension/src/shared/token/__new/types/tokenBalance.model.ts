import { z } from "zod"
import { BaseTokenSchema, TokenSchema } from "./token.model"
import { baseWalletAccountSchema } from "../../../wallet.model"

export const BaseTokenWithBalanceSchema = BaseTokenSchema.extend({
  account: z.string(),
  balance: z.string(),
})

export type BaseTokenWithBalance = z.infer<typeof BaseTokenWithBalanceSchema>

export const TokenWithBalanceSchema = TokenSchema.extend({
  account: baseWalletAccountSchema,
  balance: z.string(),
})

export type TokenWithBalance = z.infer<typeof TokenWithBalanceSchema>

export const TokenWithOptionalBigIntBalanceSchema = TokenSchema.extend({
  balance: z.bigint().optional(),
})

export type TokenWithOptionalBigIntBalance = z.infer<
  typeof TokenWithOptionalBigIntBalanceSchema
>

export const TokenWithBigIntBalanceSchema = TokenSchema.extend({
  balance: z.bigint(),
})

export type TokenWithBigIntBalance = z.infer<
  typeof TokenWithBigIntBalanceSchema
>
