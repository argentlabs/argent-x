import {
  addressSchema,
  bigDecimal,
  isEqualAddress,
  isNumeric,
  DEFAULT_TOKEN_DECIMALS,
} from "@argent/shared"
import { BaseToken, Token } from "../types/token.model"
import { BigNumberish } from "starknet"
import defaultTokens from "../../../../assets/default-tokens.json"

export const equalToken = (a?: BaseToken, b?: BaseToken) => {
  if (!a || !b) {
    return false
  }
  return a.networkId === b.networkId && isEqualAddress(a.address, b.address)
}

export interface IConvertTokenAmountToCurrencyValue {
  /** the token decimal amount */
  amount: BigNumberish
  /** number of decimals used in token amount */
  decimals: BigNumberish
  /** the currency value of 1 unit of token */
  unitCurrencyValue: number | string
}

/**
 * Converts a token amount and decimals into a final currency value, returning a raw string with many decimals
 */

export const convertTokenAmountToCurrencyValue = ({
  amount,
  decimals,
  unitCurrencyValue,
}: IConvertTokenAmountToCurrencyValue) => {
  if (
    !isNumeric(amount) ||
    !isNumeric(decimals) ||
    !isNumeric(unitCurrencyValue)
  ) {
    return
  }

  /** decimal is numeric, hence can be converted to Number */
  const decimalsNumber = Number(decimals)

  /** multiply to convert to currency */
  const currencyValue =
    BigInt(amount) *
    bigDecimal.parseUnits(unitCurrencyValue.toString(), DEFAULT_TOKEN_DECIMALS)
      .value

  /** keep as string to avoid loss of precision elsewhere */
  return bigDecimal.formatUnits({
    value: currencyValue,
    decimals: decimalsNumber + DEFAULT_TOKEN_DECIMALS,
  })
}

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  address: addressSchema.parse(token.address),
  networkId: token.network,
  decimals: parseInt(token.decimals, 10),
}))
