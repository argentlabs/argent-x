import { BigNumber } from "ethers"
import { useCallback, useEffect, useMemo } from "react"
import useSWR, { SWRResponse } from "swr"
import create from "zustand"
import { persist } from "zustand/middleware"

import erc20Tokens from "../../assets/erc20-tokens.json"
import { messageStream } from "../../shared/messages"
import { isValidAddress } from "../utils/addresses"
import { fetchTokenBalance } from "../utils/tokens"
import { useGlobalState } from "./global"

export interface TokenDetails {
  address: string
  name?: string
  symbol?: string
  decimals?: BigNumber
  networkId: string
}

const equalToken = (a: TokenDetails, b: TokenDetails) =>
  a.address === b.address && a.networkId === b.networkId

const parsedDefaultErc20Tokens = erc20Tokens.map((token) => ({
  ...token,
  decimals: BigNumber.from(token.decimals),
  networkId: token.network,
}))

interface TokenState {
  tokens: TokenDetails[]
  addToken: (token: TokenDetails) => void
  removeToken: (token: TokenDetails) => void
}

export const useTokens = create<TokenState>(
  persist(
    (set, get) => ({
      tokens: parsedDefaultErc20Tokens,
      addToken: (token: TokenDetails) => {
        if (!isValidAddress(token.address))
          throw Error("token address malformed")
        set((state) => ({ tokens: [...state.tokens, token] }))
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
                    !parsedDefaultErc20Tokens.some((defaultToken) =>
                      equalToken(token, defaultToken),
                    ),
                ),
              ]
            }
            return [key, value]
          }),
        ),
    },
  ),
)

export const addToken = (token: TokenDetails) => {
  useTokens.getState().addToken(token)
}

export const selectTokensByNetwork =
  (networkId: string) => (state: TokenState) =>
    state.tokens.filter((token) => token.networkId === networkId)

export interface TokenDetailsWithBalance extends TokenDetails {
  balance?: BigNumber
}

export const useTokensWithBalance = (): Omit<
  SWRResponse<TokenDetailsWithBalance[]>,
  "mutate"
> => {
  const { networkId, selectedWallet: walletAddress } = useGlobalState()
  const tokensInNetwork = useTokens(selectTokensByNetwork(networkId))
  const tokenAddresses = useMemo(
    () => tokensInNetwork.map((t) => t.address),
    [tokensInNetwork],
  )

  const { data, isValidating, error, mutate } = useSWR(
    [walletAddress, ...tokenAddresses],
    async (walletAddress, ...tokenAddresses) => {
      if (!walletAddress) {
        return {}
      }
      const balances = await Promise.all(
        tokenAddresses.map(async (address) =>
          fetchTokenBalance(address, walletAddress, networkId),
        ),
      )
      return balances.reduce((acc, balance, i) => {
        return {
          ...acc,
          [tokenAddresses[i]]: balance,
        }
      }, {} as Record<string, BigNumber>)
    },
    { suspense: true, refreshInterval: 30000 },
  )

  // refetch balances on transaction success
  useEffect(() => {
    const sub = messageStream.subscribe(([msg]) => {
      if (msg.type === "TRANSACTION_SUCCESS") {
        mutate() // refetch balances
      }
    })
    return () => {
      if (!sub.closed) {
        sub.unsubscribe()
      }
    }
  }, [mutate])

  const tokensWithBalance = useMemo(() => {
    return tokensInNetwork.map((token) => ({
      ...token,
      balance: data?.[token.address],
    }))
  }, [tokenAddresses, data])

  return { data: tokensWithBalance, isValidating, error }
}
