import { BigNumber } from "ethers"
import { FC, useMemo } from "react"

import { Token } from "../../../shared/token/type"
import { isNumeric } from "../../../shared/utils/number"
import { withPolling } from "../../services/swr"
import { Account } from "../accounts/Account"
import { TokenListItem, TokenListItemProps } from "./TokenListItem"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { TokenDetailsWithBalance } from "./tokens.state"
import {
  TokenBalanceErrorMessage,
  useTokenBalanceForAccount,
} from "./useTokenBalanceForAccount"

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
  const { data, isValidating } = useTokenBalanceForAccount(
    {
      token,
      account,
      shouldReturnError:
        true /** using Suspense, causes error to be returned as `balance` instead of throwing */,
    },
    {
      suspense:
        true /** Suspense allows us to show an initial loader for all tokens */,
      ...withPolling(30 * 1000) /** 30 seconds */,
    },
  )
  const { tokenWithBalance, errorMessage } = useMemo(() => {
    const tokenWithBalance: TokenDetailsWithBalance = {
      ...token,
    }
    let errorMessage: TokenBalanceErrorMessage | undefined
    if (isNumeric(data)) {
      tokenWithBalance.balance = BigNumber.from(data)
    } else {
      errorMessage = data as TokenBalanceErrorMessage
    }
    return {
      tokenWithBalance,
      errorMessage,
    }
  }, [data, token])

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
      errorMessage={errorMessage}
      {...rest}
    />
  )
}
