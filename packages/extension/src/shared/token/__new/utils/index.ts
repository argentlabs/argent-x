import { addressSchema, isEqualAddress } from "@argent/x-shared"

import { BaseToken, Token } from "../types/token.model"
import defaultTokens from "../../../../assets/default-tokens.json"

export const equalToken = (a?: BaseToken, b?: BaseToken) => {
  if (!a || !b) {
    return false
  }
  return a.networkId === b.networkId && isEqualAddress(a.address, b.address)
}

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  address: addressSchema.parse(token.address),
  networkId: token.network,
  decimals: parseInt(token.decimals, 10),
}))
