import { BigNumber } from "ethers"
import { useEffect, useMemo } from "react"
import { number } from "starknet"
import useSWR from "swr"
import create from "zustand"
import shallow from "zustand/shallow"

import { messageStream } from "../../../shared/messages"
import { Token, equalToken } from "../../../shared/token"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { isValidAddress } from "../../services/addresses"
import {
  addToken as addTokenMsg,
  getTokens,
  removeToken as removeTokenMsg,
} from "../../services/backgroundTokens"
import { useAccount } from "../accounts/accounts.state"
import { fetchAllTokensBalance } from "./tokens.service"

export interface TokenDetails extends Omit<Token, "decimals"> {
  decimals?: BigNumber
}

export interface TokenDetailsWithBalance extends TokenDetails {
  balance?: BigNumber
}

interface State {
  tokens: TokenDetails[]
  addToken: (token: Required<TokenDetails>) => void
  removeToken: (tokenAddress: string) => void
}

export const mapTokenToTokenDetails = (token: Token): TokenDetails => ({
  ...token,
  decimals: number.toBN(token.decimals),
})

export const mapTokenDetailsToToken = (
  token: Required<TokenDetails>,
): Token => ({
  ...token,
  decimals: token.decimals.toString(),
})

export const useTokens = create<State>((set, get) => ({
  tokens: [],
  addToken: async (token: Required<TokenDetails>) => {
    if (!isValidAddress(token.address)) {
      throw Error("token address malformed")
    }
    const equalTokenHit = get().tokens.find((t) => equalToken(t, token))
    if (equalTokenHit) {
      // if token already exists, but was hidden without balance, show it
      if (!equalTokenHit.showAlways) {
        return set((state) => ({
          ...state,
          tokens: state.tokens.map((t) =>
            equalToken(t, equalTokenHit) ? { ...t, showAlways: true } : t,
          ),
        }))
      }
      throw Error("token already added")
    }
    const newToken = { ...token, showAlways: true }
    await addTokenMsg(mapTokenDetailsToToken(newToken))
  },
  removeToken: async (tokenAddress: string) => {
    await removeTokenMsg(tokenAddress)
  },
}))

export const useTokensSubscription = () => {
  useEffect(() => {
    ;(async () => {
      const tokens = await getTokens()
      useTokens.setState({ tokens: tokens.map(mapTokenToTokenDetails) })
    })()

    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "UPDATE_TOKENS") {
        useTokens.setState({
          tokens: message.data.map(mapTokenToTokenDetails),
        })
      }
    })

    return () => {
      if (!subscription.closed) {
        subscription.unsubscribe()
      }
    }
  }, [])
}

export const addToken = (token: Required<TokenDetails>) => {
  useTokens.getState().addToken(token)
}

export const removeToken = (tokenAddress: string) => {
  useTokens.getState().removeToken(tokenAddress)
}

export const selectTokensByNetwork = (networkId: string) => (state: State) =>
  state.tokens.filter((token) => token.networkId === networkId)

interface UseTokens {
  tokenDetails: TokenDetailsWithBalance[]
  tokenDetailsIsInitialising: boolean
  isValidating: boolean
  error?: any
}

export const useTokensWithBalance = (
  account?: BaseWalletAccount,
): UseTokens => {
  const selectedAccount = useAccount(account)

  const tokensInNetworkSelector = useMemo(() => {
    return selectTokensByNetwork(selectedAccount?.networkId ?? "")
  }, [selectedAccount?.networkId])

  const tokenAddressesSelector = useMemo(() => {
    return (state: State) => {
      const tokensInNetwork = tokensInNetworkSelector(state)
      return tokensInNetwork.map((t) => t.address)
    }
  }, [tokensInNetworkSelector])

  // shallow compare objects and arrays
  const tokensInNetwork = useTokens(tokensInNetworkSelector, shallow)
  const tokenAddresses = useTokens(tokenAddressesSelector, shallow)

  const {
    data,
    isValidating,
    error: rawError,
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
        tokenAddresses,
        selectedAccount,
      )

      return balances
    },
    {
      refreshInterval: 30000,
    },
  )

  /**
   * FIXME:
   * Investigate what causes the SWR hook above to cache an empty object `error: {}`, usually observed after reloading the extension
   *
   * This is subsequently retreived by SWR from the cache and causes an immediately defined error if left unchecked
   *
   * You can verify this by debugging in the `set` method of `swrCacheProvider`, and
   * checking for SWR setting a value containing a key of `error` with an empty object {}
   *
   * As a workaround we check for empty object here and treat as undefined while the hook revalidates properly
   *
   */

  const error: any = useMemo(() => {
    if (!rawError) {
      return
    }
    try {
      if (JSON.stringify(rawError) === "{}") {
        console.warn("FIXME: Ignoring empty object {} error")
        return
      }
    } catch (e) {
      // ignore any stringify errors
    }
    return rawError
  }, [rawError])

  const tokenDetailsIsInitialising = !error && !data && isValidating

  // refetch balances on transaction success
  useEffect(() => {
    const subscription = messageStream.subscribe(([msg]) => {
      if (msg.type === "TRANSACTION_SUCCESS") {
        mutate() // refetch balances
      }
    })
    return () => {
      if (!subscription.closed) {
        subscription.unsubscribe()
      }
    }
  }, [mutate])

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
