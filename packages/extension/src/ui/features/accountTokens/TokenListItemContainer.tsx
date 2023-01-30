import { FC } from "react"

import { Token } from "../../../shared/token/type"
import { Account } from "../accounts/Account"
import { TokenListItem, TokenListItemProps } from "./TokenListItem"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { useTokenBalanceForAccount } from "./useTokenBalanceForAccount"

export interface TokenListItemContainerProps
  extends Omit<TokenListItemProps, "currencyValue"> {
  token: Token
  account: Account
}

/**
 * Fetches the token balance or error, currency value and renders them with {@link TokenListItem}
 */

export const TokenListItemContainer: FC<TokenListItemContainerProps> = ({
  token,
  account,
  ...rest
}) => {
  const { tokenWithBalance, errorMessage, isValidating } =
    useTokenBalanceForAccount(
      {
        token,
        account,
        shouldReturnError:
          true /** using Suspense, causes error to be returned as `balance` instead of throwing */,
      },
      {
        suspense:
          true /** Suspense allows us to show an initial loader for all tokens */,
        refreshInterval: 60 * 1000 /** 60 seconds */,
      },
    )

  const currencyValue = useTokenBalanceToCurrencyValue(tokenWithBalance)
  const shouldShow =
    token.showAlways ||
    (tokenWithBalance?.balance && tokenWithBalance?.balance.gt(0))
  if (!shouldShow || tokenWithBalance === undefined) {
    return null
  }
  return (
    <TokenListItem
      token={tokenWithBalance}
      currencyValue={currencyValue}
      isLoading={isValidating}
      errorMessage={errorMessage}
      {...rest}
    />
  )
}
