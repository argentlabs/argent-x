import { FC } from "react"

import { Account } from "../accounts/Account"
import { TokenListItem, TokenListItemProps } from "./TokenListItem"
import { useTokenBalanceForAccount } from "./useTokenBalanceForAccount"
import { TokenWithBalanceAndPrice } from "../../../shared/token/__new/types/tokenPrice.model"

export interface TokenListItemContainerProps
  extends Omit<TokenListItemProps, "currencyValue" | "token"> {
  token: TokenWithBalanceAndPrice
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

  const shouldShow =
    token.showAlways ||
    token.custom ||
    (tokenWithBalance?.balance && tokenWithBalance.balance > 0n)
  if (!shouldShow || tokenWithBalance === undefined) {
    return null
  }

  return (
    <TokenListItem
      token={token}
      currencyValue={token.usdValue}
      isLoading={false}
      {...rest}
    />
  )
}
