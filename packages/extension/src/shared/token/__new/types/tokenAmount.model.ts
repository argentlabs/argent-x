/**
 * This file is similar to tokenBalance.model.ts
 * but it uses the field amount instead of balance
 * for proper notation of the field in the application
 *
 * Balance can be thought of as the balance of the user using the wallet
 * However, amount can be any amount of tokens regardless of the user's balance
 *
 * Please use TokenAmount and TokenBalance accordingly
 * */

import { z } from "zod"

import { BaseTokenSchema, TokenSchema } from "./token.model"

export const BaseTokenAmountSchema = BaseTokenSchema.extend({
  amount: z.bigint(),
})

export const TokenAmountSchema = TokenSchema.extend({
  amount: z.bigint(),
})

export type BaseTokenAmount = z.infer<typeof BaseTokenAmountSchema>
export type TokenAmount = z.infer<typeof TokenAmountSchema>
