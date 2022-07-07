import { BigNumber } from "ethers"
import { useEffect, useMemo } from "react"
import { number } from "starknet"
import useSWR from "swr"
import create from "zustand"

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
  isValidating: boolean
  error?: any
}

export const useTokensWithBalance = (
  account?: BaseWalletAccount,
): UseTokens => {
  const selectedAccount = useAccount(account)
  const tokensInNetwork = useTokens(
    selectTokensByNetwork(selectedAccount?.networkId ?? ""),
  )
  const tokenAddresses = useMemo(
    () => tokensInNetwork.map((t) => t.address),
    [tokensInNetwork],
  )

  const { data, isValidating, error, mutate } = useSWR(
    // skip if no account selected
    selectedAccount && [
      getAccountIdentifier(selectedAccount),
      "accountTokenBalances",
    ],
    async () => {
      if (!selectedAccount) {
        return {}
      }

      const balances = await fetchAllTokensBalance(
        tokenAddresses,
        selectedAccount,
      )

      return balances ?? {}
    },
    {
      suspense: true,
      refreshInterval: 30000,
    },
  )

  // refetch balances on transaction success or token edit (token was added or removed)
  useEffect(() => {
    mutate()
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
  }, [tokenAddresses.join(":")])

  const tokenDetails = useMemo(() => {
    return tokensInNetwork
      .map((token) => ({
        ...token,
        balance: data?.[token.address] ?? BigNumber.from(0),
      }))
      .filter(
        (token) => token.showAlways || (token.balance && token.balance.gt(0)),
      )
  }, [tokenAddresses, data])

  return { tokenDetails, isValidating, error }
}
