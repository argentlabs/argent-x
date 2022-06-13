import { constants, utils } from "ethers"
import { number } from "starknet"
import { string } from "yup"

import defaultTokens from "../assets/default-tokens.json"

export interface RequestToken {
  address: string
  networkId?: string
  name?: string
  symbol?: string
  decimals?: string
}

export interface Token extends Required<RequestToken> {
  image?: string
  showAlways?: boolean
}

export type UniqueToken = Pick<RequestToken, "address" | "networkId">

export const equalToken = (a: UniqueToken, b: UniqueToken) =>
  a.address === b.address && a.networkId === b.networkId

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
}))

export const testDappToken = (networkId: string) =>
  defaultTokens.find(
    ({ name, network }) => name === "Test Token" && network === networkId,
  )

export const getFeeToken = (networkId: string) =>
  parsedDefaultTokens.find(
    ({ symbol, networkId: network }) =>
      symbol === "ETH" && network === networkId,
  )

export const parseAmount = (
  amount: string,
  decimals: number.BigNumberish = 18,
) => {
  return utils.parseUnits(
    amount.replace(",", "."),
    number.toBN(decimals).toNumber(),
  )
}

export const inputAmountSchema = string()
  .trim()
  .required("Amount is required")
  .test((amount, ctx) => {
    if (!amount) {
      return ctx.createError({ message: "Amount is required" })
    }

    try {
      const bn = parseAmount(amount)
      if (bn.isNegative()) {
        return ctx.createError({ message: "Amount must be positive" })
      }
      if (bn.eq(0)) {
        return ctx.createError({ message: "Amount can not be zero" })
      }
      if (bn.lte(constants.MaxUint256)) {
        return ctx.createError({ message: "Amount is too big" })
      }
    } catch {
      return ctx.createError({ message: "Amount should be a number" })
    }

    return true
  })

export const isValidInputAmount = (amount: string) =>
  inputAmountSchema.isValidSync(amount)
