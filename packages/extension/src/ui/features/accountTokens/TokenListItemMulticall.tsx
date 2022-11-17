import { BigNumber } from "ethers"
import { get } from "lodash-es"
import { FC, useMemo } from "react"

import { Token } from "../../../shared/token/type"
import { IS_DEV } from "../../../shared/utils/dev"
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

const isNetworkError = (errorCode: string | number) => {
  if (!isNumeric(errorCode)) {
    return false
  }
  const code = Number(errorCode)
  return [429, 502].includes(code)
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
  const { tokenWithBalance, errorMessage } = useMemo(() => {
    const tokenWithBalance: TokenDetailsWithBalance = {
      ...token,
    }
    let errorMessage: string | undefined
    if (isNumeric(balanceOrError)) {
      tokenWithBalance.balance = BigNumber.from(balanceOrError)
    } else {
      const errorCode = get(balanceOrError, "errorCode")
      if (errorCode === "StarknetErrorCode.UNINITIALIZED_CONTRACT") {
        /* token contract not found on this network */
        errorMessage = "Token not found"
      } else if (isNetworkError(errorCode)) {
        errorMessage = "Network error"
      } else {
        IS_DEV &&
          console.warn(
            `TokenListItemMulticall - ignoring errorCode ${errorCode} with error:`,
            balanceOrError,
          )
      }
    }
    return {
      tokenWithBalance,
      errorMessage,
    }
  }, [balanceOrError, token])

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
