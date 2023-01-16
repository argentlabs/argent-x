import { BigNumber } from "ethers"
import { memoize } from "lodash-es"
import { useEffect, useMemo, useRef } from "react"
import { number } from "starknet"
import useSWR from "swr"

import { useAccount } from "../ui/features/accounts/accounts.state"
import { useAccountTransactions } from "../ui/features/accounts/accountTransactions.state"
import { fetchAllTokensBalance } from "../ui/features/accountTokens/tokens.service"
import { useArrayStorage } from "./storage/hooks"
import { tokenStore } from "./token/storage"
import { BaseToken, Token } from "./token/type"
import { equalToken } from "./token/utils"
import { BaseWalletAccount } from "./wallet.model"
import { getAccountIdentifier } from "./wallet.service"

export interface TokenDetailsWithBalance extends Token {
  balance?: BigNumber
}

interface UseTokensWithBalance {
  tokenDetails: TokenDetailsWithBalance[]
  tokenDetailsIsInitialising: boolean
  isValidating: boolean
  error?: any
}

const networkIdSelector = memoize(
  (networkId: string) => (token: Token) => token.networkId === networkId,
)

const feeTokenSelector = memoize(
  (networkId: string) => (token: Token) =>
    token.networkId === networkId && token.symbol === "ETH",
)

export const getNetworkFeeToken = async (networkId: string) => {
  const [feeToken] = await tokenStore.get(feeTokenSelector(networkId))
  return feeToken ?? null
}

export const useNetworkFeeToken = (networkId?: string) => {
  const [feeToken] = useArrayStorage(
    tokenStore,
    networkId ? feeTokenSelector(networkId) : () => false,
  )
  return feeToken ?? null
}

const tokenSelector = memoize(
  (baseToken: BaseToken) => (token: Token) => equalToken(token, baseToken),
  (baseToken) => getAccountIdentifier(baseToken),
)

export const useTokensInNetwork = (networkId: string) =>
  useArrayStorage(tokenStore, networkIdSelector(networkId))

export const useToken = (baseToken: BaseToken): Token | undefined => {
  const [token] = useArrayStorage(tokenStore, tokenSelector(baseToken))
  return token
}

export const useTokens = (baseTokens: BaseToken[]) => {
  const tokens = useArrayStorage(tokenStore, (tokenInList) =>
    baseTokens.some((baseToken) => equalToken(tokenInList, baseToken)),
  )
  return useMemo(
    () => baseTokens.map((baseToken) => tokens.find((t) => t === baseToken)),
    [baseTokens, tokens],
  )
}

export type TokensRecord = Record<string, Token>

export const useTokensRecord = ({ cleanHex = false }) => {
  const tokens = useArrayStorage(tokenStore)

  return useMemo(
    () =>
      tokens.reduce<TokensRecord>((acc, token) => {
        const tokenAddress = cleanHex
          ? number.cleanHex(token.address)
          : token.address

        return {
          ...acc,
          [tokenAddress]: token,
        }
      }, {}),
    [cleanHex, tokens],
  )
}

/** error codes to suppress - will not bubble error up to parent */
const SUPPRESS_ERROR_STATUS = [429]

export const useTokensWithBalance = (
  account?: BaseWalletAccount,
): UseTokensWithBalance => {
  const selectedAccount = useAccount(account)
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingTransactionsLengthRef = useRef(pendingTransactions.length)

  const networkId = useMemo(() => {
    return selectedAccount?.networkId ?? ""
  }, [selectedAccount?.networkId])

  const tokensInNetwork = useTokensInNetwork(networkId)

  const tokenAddresses = useMemo(
    () => tokensInNetwork.map((t) => t.address),
    [tokensInNetwork],
  )

  const {
    data,
    isValidating,
    error: maybeSuppressError,
    mutate,
  } = useSWR(
    // skip if no account selected
    selectedAccount && [
      getAccountIdentifier(selectedAccount),
      "accountTokenBalances",
    ],
    async () => {
      if (!selectedAccount) {
        return
      }

      const balances = await fetchAllTokensBalance(
        tokensInNetwork.map((t) => t.address),
        selectedAccount,
      )

      return balances
    },
    {
      refreshInterval: 30000,
      shouldRetryOnError: (error) => {
        const errorCode = error?.status || error?.errorCode
        const suppressError =
          errorCode && SUPPRESS_ERROR_STATUS.includes(errorCode)
        return suppressError
      },
    },
  )

  const error = useMemo(() => {
    const errorCode =
      maybeSuppressError?.status || maybeSuppressError?.errorCode
    if (!SUPPRESS_ERROR_STATUS.includes(errorCode)) {
      return maybeSuppressError
    }
  }, [maybeSuppressError])

  const tokenDetailsIsInitialising = !error && !data

  // refetch when number of pending transactions goes down
  useEffect(() => {
    if (pendingTransactionsLengthRef.current > pendingTransactions.length) {
      mutate()
    }
    pendingTransactionsLengthRef.current = pendingTransactions.length
  }, [mutate, pendingTransactions.length])

  // refetch balances on token edit (token was added or removed)
  useEffect(() => {
    mutate()
  }, [mutate, tokenAddresses])

  const tokenDetails = useMemo(() => {
    return tokensInNetwork
      .map((token) => ({
        ...token,
        balance: data?.[token.address] ?? BigNumber.from(0),
      }))
      .filter(
        (token) => token.showAlways || (token.balance && token.balance.gt(0)),
      )
  }, [tokensInNetwork, data])

  return {
    tokenDetails,
    tokenDetailsIsInitialising,
    isValidating,
    error,
  }
}
