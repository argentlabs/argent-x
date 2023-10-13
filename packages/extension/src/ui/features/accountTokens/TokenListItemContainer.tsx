import { FC } from "react"

import { Account } from "../accounts/Account"
import { TokenListItem, TokenListItemProps } from "./TokenListItem"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { useTokenBalanceForAccount } from "./useTokenBalanceForAccount"
import { Token } from "../../../shared/token/__new/types/token.model"

export interface TokenListItemContainerProps
  extends Omit<TokenListItemProps, "currencyValue"> {
  token: Token
  account: Pick<Account, "network" | "address" | "networkId">
}

/**
 * Fetches the token balance or error, currency value and renders them with {@link TokenListItem}
 */

export const TokenListItemContainer: FC<TokenListItemContainerProps> = ({
  token,
  account,
  ...rest
}) => {
  const tokenWithBalance = useTokenBalanceForAccount({
    token,
    account,
  })
  const currencyValue = useTokenBalanceToCurrencyValue(tokenWithBalance)
  const shouldShow =
    token.showAlways ||
    token.custom ||
    (tokenWithBalance?.balance && tokenWithBalance.balance > 0n)
  if (!shouldShow || tokenWithBalance === undefined) {
    return null
  }
  return (
    <TokenListItem
      token={tokenWithBalance}
      currencyValue={currencyValue}
      isLoading={false}
      errorMessage={undefined}
      {...rest}
    />
  )
}
