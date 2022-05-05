import { BigNumber } from "ethers"
import { useEffect, useMemo, useRef } from "react"
import { number } from "starknet"
import useSWR from "swr"
import useSWRImmutable from "swr/immutable"
import create from "zustand"

import { messageStream } from "../../shared/messages"
import { Token, equalToken, parsedDefaultTokens } from "../../shared/token"
import { isValidAddress } from "../utils/addresses"
import {
  addToken as addTokenMsg,
  getTokens,
  removeToken as removeTokenMsg,
} from "../utils/messaging"
import { fetchTokenBalance } from "../utils/tokens"
import { useSelectedAccount } from "./account"
import { useAppState } from "./app"

export interface TokenDetails
  extends Pick<Token, "address" | "networkId">,
    Partial<Omit<Token, "decimals" | "address" | "networkId">> {
  decimals?: BigNumber
}

export interface TokenDetailsWithBalance extends TokenDetails {
  balance?: BigNumber
}

interface State {
  tokens: TokenDetails[]
  addToken: (token: Required<TokenDetails>) => void
  removeToken: (tokenAddress: TokenDetails["address"]) => void
}

const mapTokenToTokenDetails = (token: Token): TokenDetails => ({
  ...token,
  decimals: number.toBN(token.decimals),
})

const mapTokenDetailsToToken = (token: Required<TokenDetails>): Token => ({
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

    // optimistic update
    set((state) => ({
      tokens: [...state.tokens, newToken],
    }))
  },
  removeToken: async (tokenAddress: TokenDetails["address"]) => {
    await removeTokenMsg(tokenAddress)

    // optimistic update
    set((state) => ({
      tokens: state.tokens.filter((t) => t.address !== tokenAddress),
    }))
  },
}))

export const useTokensSubscription = () => {
  const { data: tokens = [] } = useSWRImmutable("tokens", () => getTokens(), {
    suspense: true,
  })

  useEffect(() => {
    useTokens.setState({
      tokens: parsedDefaultTokens.concat(tokens).map(mapTokenToTokenDetails),
    })

    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "UPDATE_TOKENS") {
        useTokens.setState({
          tokens: parsedDefaultTokens
            .concat(message.data)
            .map(mapTokenToTokenDetails),
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

export const removeToken = (tokenAddress: TokenDetails["address"]) => {
  useTokens.getState().removeToken(tokenAddress)
}

export const selectTokensByNetwork = (networkId: string) => (state: State) =>
  state.tokens.filter((token) => token.networkId === networkId)

type BalancesMap = Record<string, BigNumber | undefined>
function mergeMaps(oldMap: BalancesMap, newMap: BalancesMap): BalancesMap {
  return Object.fromEntries([
    ...Object.entries(oldMap).map(([key, value]) => [
      key,
      newMap[key] ?? value,
    ]),
    ...Object.entries(newMap).map(([key, value]) => [
      key,
      value ?? oldMap[key],
    ]),
  ])
}

interface UseTokens {
  tokenDetails: TokenDetailsWithBalance[]
  isValidating: boolean
  error?: any
}

export const useTokensWithBalance = (): UseTokens => {
  const { switcherNetworkId } = useAppState()
  const selectedAccount = useSelectedAccount()
  const tokensInNetwork = useTokens(selectTokensByNetwork(switcherNetworkId))
  const tokenAddresses = useMemo(
    () => tokensInNetwork.map((t) => t.address),
    [tokensInNetwork],
  )

  const { data, isValidating, error, mutate } = useSWR(
    [selectedAccount, ...tokenAddresses],
    async (selectedAccount, ...tokenAddresses) => {
      if (!selectedAccount) {
        return {}
      }
      const balances = await Promise.all(
        tokenAddresses.map(async (address) =>
          fetchTokenBalance(address, selectedAccount).catch(() => undefined),
        ),
      )
      return balances.reduce((acc, balance, i) => {
        return {
          ...acc,
          [tokenAddresses[i]]: balance,
        }
      }, {} as BalancesMap)
    },
    {
      suspense: true,
      refreshInterval: 30000,
      use: [
        (useSWRNext) => {
          return (key, fetcher, config) => {
            const prevResultRef = useRef<any>()

            const swr = useSWRNext(key, fetcher, config)

            const data =
              swr.data && prevResultRef.current
                ? (mergeMaps(prevResultRef.current, swr.data as any) as any)
                : swr.data

            useEffect(() => {
              if (swr.data !== undefined) {
                prevResultRef.current = data
              }
            }, [data])

            return {
              ...(swr as any),
              data,
            }
          }
        },
      ],
    },
  )

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

  const tokenDetails = useMemo(() => {
    return tokensInNetwork
      .map((token) => ({
        ...token,
        balance: data?.[token.address],
      }))
      .filter(
        (token) => token.showAlways || (token.balance && token.balance.gt(0)),
      )
  }, [tokenAddresses, data])

  return { tokenDetails, isValidating, error }
}
