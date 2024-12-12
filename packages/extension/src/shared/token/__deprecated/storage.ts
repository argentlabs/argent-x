import { z } from "zod"

import { ArrayStorage } from "../../storage"
import type { BaseToken, Token } from "./type"
import { BaseTokenSchema } from "./type"
import { equalToken, parsedDeprecatedTokens } from "./utils"

export const tokenStore = new ArrayStorage(parsedDeprecatedTokens, {
  namespace: "core:tokens",
  areaName: "local",
  compare: equalToken,
})

export const tokenSchema = BaseTokenSchema.extend({
  name: z.string({ required_error: "Name is required" }),
  symbol: z
    .string({
      required_error: "Symbol is required",
    })
    .min(1, { message: "Symbol must be atleast 1 character" }),
  decimals: z.number({ required_error: "Decimals is required" }),
  image: z.string().optional(),
  showAlways: z.boolean().optional(),
})

export async function addToken(token: Token) {
  const newToken: Token = tokenSchema.parse({
    ...token,
    showAlways: true,
  })

  return tokenStore.push(newToken)
}

export async function hasToken(token: BaseToken) {
  const parsedToken = BaseTokenSchema.parse(token)
  const [hit] = await tokenStore.get((t) => equalToken(t, parsedToken))
  return Boolean(hit)
}

export async function removeToken(token: BaseToken) {
  const parsedToken = BaseTokenSchema.parse(token)
  return tokenStore.remove((t) => equalToken(t, parsedToken))
}
