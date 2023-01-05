import {
  Currency,
  CurrencyAmount,
  ETHER,
  SupportedNetworks,
  Token,
  TokenAmount,
  WETH,
} from "../../sdk"

export function wrappedCurrency(
  currency: Currency | undefined,
  networkId: SupportedNetworks | undefined,
): Token | undefined {
  return networkId && currency === ETHER
    ? WETH[networkId]
    : currency instanceof Token
    ? currency
    : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  networkId: SupportedNetworks | undefined,
): TokenAmount | undefined {
  const token =
    currencyAmount && networkId
      ? wrappedCurrency(currencyAmount.currency, networkId)
      : undefined
  return token && currencyAmount
    ? new TokenAmount(token, currencyAmount.raw)
    : undefined
}

export function unwrappedToken(token: Token): Currency {
  if (token.equals(WETH[token.networkId])) {
    return ETHER
  }
  return token
}
