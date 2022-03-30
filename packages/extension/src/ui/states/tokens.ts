import { BigNumber } from "ethers"
import { useEffect, useMemo, useRef } from "react"
import useSWR from "swr"
import create from "zustand"
import { persist } from "zustand/middleware"

import defaultTokens from "../../assets/default-tokens.json"
import { messageStream } from "../../shared/messages"
import { isValidAddress } from "../utils/addresses"
import { fetchTokenBalance } from "../utils/tokens"
import { useAccount } from "./account"
import { useAppState } from "./app"

export interface TokenDetails {
  address: string
  name?: string
  symbol?: string
  decimals?: BigNumber
  networkId: string
  image?: string
  showAlways?: boolean
}

const equalToken = (a: TokenDetails, b: TokenDetails) =>
  a.address === b.address && a.networkId === b.networkId

const parsedDefaultTokens = defaultTokens.map((token) => ({
  ...token,
  decimals: BigNumber.from(token.decimals),
  networkId: token.network,
}))

interface State {
  tokens: TokenDetails[]
  addToken: (token: TokenDetails) => void
  removeToken: (token: TokenDetails) => void
}

export const useTokens = create<State>(
  persist(
    (set, get) => ({
      tokens: parsedDefaultTokens,
      addToken: (token: TokenDetails) => {
        if (!isValidAddress(token.address)) {
          throw Error("token address malformed")
        }
        const equalTokenHit = get().tokens.find((t) => equalToken(t, token))
        // if token already exists, but was hidden without balance, show it
        if (equalTokenHit) {
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
        set((state) => ({
          tokens: [...state.tokens, { ...token, showAlways: true }],
        }))
      },
      removeToken: (token: TokenDetails) => {
        set((state) => ({
          tokens: state.tokens.filter((t) => t.address !== token.address),
        }))
      },
    }),
    {
      name: "tokens", // name of item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        tokens: [...currentState.tokens, ...persistedState.tokens],
      }),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).map(([key, value]) => {
            if (key === "tokens") {
              return [
                key,
                (value as TokenDetails[]).filter(
                  (token) =>
                    !parsedDefaultTokens.some((defaultToken) =>
                      equalToken(token, defaultToken),
                    ),
                ),
              ]
            }
            return [key, value]
          }),
        ),
      deserialize: (str) =>
        JSON.parse(str, (_, v) => {
          if (
            typeof v === "object" &&
            "type" in v &&
            "hex" in v &&
            v.type === "BigNumber"
          ) {
            return BigNumber.from(v.hex)
          }
          return v
        }),
    },
  ),
)

export const addToken = (token: TokenDetails) => {
  useTokens.getState().addToken(token)
}

export const removeToken = (token: TokenDetails) => {
  useTokens.getState().removeToken(token)
}

export const selectTokensByNetwork = (networkId: string) => (state: State) =>
  state.tokens.filter((token) => token.networkId === networkId)

export interface TokenDetailsWithBalance extends TokenDetails {
  balance?: BigNumber
}

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
  const { selectedAccount } = useAccount()
  const tokensInNetwork = useTokens(selectTokensByNetwork(switcherNetworkId))
  const tokenAddresses = useMemo(
    () => tokensInNetwork.map((t) => t.address),
    [tokensInNetwork],
  )

  const { data, isValidating, error, mutate } = useSWR(
    [selectedAccount, ...tokenAddresses],
    async (accountAddress, ...tokenAddresses) => {
      if (!accountAddress) {
        return {}
      }
      const balances = await Promise.all(
        tokenAddresses.map(async (address) =>
          fetchTokenBalance(address, accountAddress, switcherNetworkId).catch(
            () => undefined,
          ),
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
