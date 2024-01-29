import { addressSchema, isEqualAddress } from "@argent/shared"
import { get } from "lodash-es"
import { useEffect, useMemo, useRef } from "react"
import useSWR, { SWRConfiguration } from "swr"

import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { isNumeric } from "../../../shared/utils/number"
import { getAccountIdentifier } from "../../../shared/wallet.service"

import { tokenService } from "../../services/tokens"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { num } from "starknet"
import { TokenWithOptionalBigIntBalance } from "../../../shared/token/__new/types/tokenBalance.model"
import { Token } from "../../../shared/token/__new/types/token.model"

interface UseTokenBalanceForAccountArgs {
  /** Not passing valid `token` will return undefined `tokenWithBalance` with descrption in `errorMessage`, this allows for lazy loading */
  token?: Token
  account?: Pick<Account, "network" | "address" | "networkId">
  /** Return `data` as {@link TokenBalanceErrorMessage} rather than throwing so the UI can choose if / how to display it to the user without `ErrorBoundary` */
  shouldReturnError?: boolean
}

/**
 * Get the individual token balance for the account, using Multicall if available
 * This will automatically mutate when the number of pending transactions decreases
 */

export const useLiveTokenBalanceForAccount = (
  { token, account, shouldReturnError = false }: UseTokenBalanceForAccountArgs,
  config?: SWRConfiguration,
) => {
  const { pendingTransactions } = useAccountTransactions(account)

  const pendingTransactionsLengthRef = useRef(pendingTransactions.length)
  const key =
    token && account
      ? [
          getAccountIdentifier(account),
          "balanceOf",
          token.address,
          token.networkId,
        ]
      : null
  const { data, mutate, isValidating, ...rest } = useSWR<
    string | TokenBalanceErrorMessage | undefined
  >(
    key,
    async () => {
      if (!token || !account) {
        return
      }
      try {
        const balance = await tokenService.fetchTokenBalance(
          token.address,
          addressSchema.parse(account.address),
          account.networkId,
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
      void mutate()
    }
    pendingTransactionsLengthRef.current = pendingTransactions.length
  }, [mutate, pendingTransactions.length])

  /** as a convenience, also return the token with balance and error message */
  const { tokenWithBalance, errorMessage } = useMemo(() => {
    if (!token) {
      return {
        tokenWithBalance: undefined,
        errorMessage: {
          message: "Error",
          description: "token is not defined",
        },
      }
    }
    const tokenWithBalance: TokenWithOptionalBigIntBalance = {
      ...token,
    }
    let errorMessage: TokenBalanceErrorMessage | undefined
    // strict type checking as BigInt doesn't allow passing undefined or TokenBalanceErrorMessage type
    if (data && isNumeric(data) && typeof data === "string") {
      tokenWithBalance.balance = num.toBigInt(data)
    } else {
      //   tokenWithBalance.balance = cachedBalance?.balance
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
    tokenBalanceLoading: !data && isValidating,
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
