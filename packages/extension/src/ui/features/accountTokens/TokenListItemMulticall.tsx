import { BigNumber } from "ethers"
import { FC } from "react"

import { Token } from "../../../shared/token/type"
import { isNumeric } from "../../../shared/utils/number"
import { withPolling } from "../../services/swr"
import { Account } from "../accounts/Account"
import { TokenListItem, TokenListItemProps } from "./TokenListItem"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { TokenDetailsWithBalance } from "./tokens.state"
import { useTokenBalanceForAccount } from "./useTokenBalanceForAccount"

export interface TokenListItemMulticallProps
  extends Omit<TokenListItemProps, "currencyValue"> {
  token: Token
  account: Account
}

export const TokenListItemMulticall: FC<TokenListItemMulticallProps> = ({
  token,
  account,
  ...rest
}) => {
  const { balanceOrError, isValidating } = useTokenBalanceForAccount(
    token,
    account,
    {
      suspense: true,
      ...withPolling(30 * 1000) /** 30 seconds */,
    },
  )
  const tokenWithBalance: TokenDetailsWithBalance = {
    ...token,
    balance: BigNumber.from(0),
  }
  if (isNumeric(balanceOrError)) {
    tokenWithBalance.balance = BigNumber.from(balanceOrError)
  } else if (balanceOrError instanceof Error) {
    // currently the ui does not surface error to the user - multicall should retry silently anyway
  }
  const currencyValue = useTokenBalanceToCurrencyValue(tokenWithBalance)
  const shouldShow =
    token.showAlways ||
    (tokenWithBalance.balance && tokenWithBalance.balance.gt(0))
  if (!shouldShow) {
    return null
  }
  return (
    <TokenListItem
      token={tokenWithBalance}
      currencyValue={currencyValue}
      isLoading={isValidating}
      {...rest}
    />
  )
}
