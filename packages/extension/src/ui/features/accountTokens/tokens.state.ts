import { BigNumber } from "ethers"
import { memoize } from "lodash-es"
import { useEffect, useMemo } from "react"
import useSWR from "swr"

import { useArrayStorage } from "../../../shared/storage/hooks"
import { tokenStore } from "../../../shared/token/storage"
import { BaseToken, Token } from "../../../shared/token/type"
import { equalToken } from "../../../shared/token/utils"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { useAccount } from "../accounts/accounts.state"
import { fetchAllTokensBalance } from "./tokens.service"

export interface TokenDetailsWithBalance extends Token {
  balance?: BigNumber
}

interface UseTokens {
  tokenDetails: TokenDetailsWithBalance[]
  tokenDetailsIsInitialising: boolean
  isValidating: boolean
  error?: any
}

const networkIdSelector = memoize(
  (networkId: string) => (token: Token) => token.networkId === networkId,
)

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

/** error codes to suppress - will not bubble error up to parent */
const SUPPRESS_ERROR_STATUS = [429]

export const useTokensWithBalance = (
  account?: BaseWalletAccount,
): UseTokens => {
  const selectedAccount = useAccount(account)
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
        const suppressError = SUPPRESS_ERROR_STATUS.includes(error?.status)
        return suppressError
      },
    },
  )

  const error = useMemo(() => {
    if (!SUPPRESS_ERROR_STATUS.includes(maybeSuppressError?.status)) {
      return maybeSuppressError
    }
  }, [maybeSuppressError])

  const tokenDetailsIsInitialising = !error && !data

  // TODO: refetch balances on transaction success

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
