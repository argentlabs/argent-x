import { BigNumber } from "ethers"
import { get } from "lodash-es"
import { useEffect, useMemo, useRef } from "react"
import useSWR, { SWRConfiguration } from "swr"

import { getTokenBalanceForAccount } from "../../../shared/token/getTokenBalance"
import { Token } from "../../../shared/token/type"
import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { isNumeric } from "../../../shared/utils/number"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { isEqualAddress } from "../../services/addresses"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { TokenDetailsWithBalance } from "./tokens.state"

interface UseTokenBalanceForAccountArgs {
  token: Token
  account: Account
  /** Return `data` as {@link TokenBalanceErrorMessage} rather than throwing so the UI can choose if / how to display it to the user without `ErrorBoundary` */
  shouldReturnError?: boolean
}

/**
 * Get the individual token balance for the account, using Multicall if available
 * This will automatically mutate when the number of pending transactions decreases
 */

export const useTokenBalanceForAccount = (
  { token, account, shouldReturnError = false }: UseTokenBalanceForAccountArgs,
  config?: SWRConfiguration,
) => {
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingTransactionsLengthRef = useRef(pendingTransactions.length)
  const { data, mutate, ...rest } = useSWR<string | TokenBalanceErrorMessage>(
    [
      getAccountIdentifier(account),
      "balanceOf",
      token.address,
      token.networkId,
      account.network.multicallAddress,
    ],
    async () => {
      try {
        const balance = await getTokenBalanceForAccount(
          token.address,
          account.toBaseWalletAccount(),
        )
        return balance
      } catch (error) {
        if (shouldReturnError) {
          return errorToMessage(
            error,
            token.address,
            account.network.multicallAddress,
          )
        } else {
          throw error
        }
      }
    },
    config,
  )

  // refetch when number of pending transactions goes down
  useEffect(() => {
    if (pendingTransactionsLengthRef.current > pendingTransactions.length) {
      mutate()
    }
    pendingTransactionsLengthRef.current = pendingTransactions.length
  }, [mutate, pendingTransactions.length])

  /** as a convenience, also return the token with balance and error message */
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

  return {
    tokenWithBalance,
    errorMessage,
    data,
    mutate,
    ...rest,
  }
}

const isNetworkError = (errorCode: string | number) => {
  if (!isNumeric(errorCode)) {
    return false
  }
  const code = Number(errorCode)
  return [429, 502].includes(code)
}

export interface TokenBalanceErrorMessage {
  message: string
  description: string
}

const errorToMessage = (
  error: unknown,
  tokenAddress: string,
  multicallAddress?: string,
): TokenBalanceErrorMessage => {
  const errorCode = get(error, "errorCode") as any
  const message = get(error, "message") as any
  if (errorCode === "StarknetErrorCode.UNINITIALIZED_CONTRACT") {
    /** tried to use a contract not found on this network */
    /** message like "Requested contract address 0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4 is not deployed" */
    const contractAddressMatches = message.match(/(0x[0-9a-f]+)/gi)
    const contractAddress = contractAddressMatches?.[0] ?? undefined
    if (contractAddress) {
      if (isEqualAddress(contractAddress, tokenAddress)) {
        return {
          message: "Token not found",
          description: `Token with address ${tokenAddress} not deployed on this network`,
        }
      } else if (
        multicallAddress &&
        isEqualAddress(contractAddress, multicallAddress)
      ) {
        return {
          message: "No Multicall",
          description: `Multicall contract with address ${multicallAddress} not deployed on this network`,
        }
      }
      return {
        message: "Missing contract",
        description: `Contract with address ${contractAddress} not deployed on this network`,
      }
    }
    return {
      message: "Missing contract",
      description: message,
    }
  } else if (
    errorCode === "StarknetErrorCode.ENTRY_POINT_NOT_FOUND_IN_CONTRACT"
  ) {
    /** not a token */
    return {
      message: "Invalid token",
      description: `This is not a valid token contract`,
    }
  } else if (isNetworkError(errorCode)) {
    /* some other network error */
    return {
      message: "Network error",
      description: message,
    }
  } else {
    /* show a console message in dev for any unhandled errors that could be better handled here */
    IS_DEV &&
      console.warn(
        `useTokenBalanceForAccount - ignoring errorCode ${errorCode} with error:`,
        coerceErrorToString(error),
      )
  }
  return {
    message: "Error",
    description: message,
  }
}
