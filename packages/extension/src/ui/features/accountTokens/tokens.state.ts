import { useMemo } from "react"
import { num } from "starknet"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import {
  allTokensView,
  allTokensInfoView,
  networkFeeTokensOnNetworkFamily,
} from "../../views/token"
import { BaseToken, Token } from "../../../shared/token/__new/types/token.model"
import { Address, isEqualAddress } from "@argent/x-shared"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { equalToken } from "../../../shared/token/__new/utils"
import { tokenBalancesForAccountViewFamily } from "../../views/tokenBalances"
import { atomFamily } from "jotai/utils"
import { UseToken } from "@argent/x-ui"
import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../hooks/useStorage"
import { selectedNetworkIdView } from "../../views/network"
import { atom } from "jotai"

export const useNetworkFeeTokens = (networkId?: string) => {
  const feeTokens = useView(networkFeeTokensOnNetworkFamily(networkId))
  return feeTokens
}

export const tokensInNetwork = atomFamily(
  (networkId?: string) => {
    return atom(async (get) => {
      const allTokens = await get(allTokensView)
      return allTokens.filter((t) => t.networkId === networkId)
    })
  },
  (a, b) => a === b,
)

export const useTokensInCurrentNetworkIncludingSpam = () => {
  const currentNetwork = useCurrentNetwork()
  const rawTokens = useView(tokensInNetwork(currentNetwork?.id ?? ""))
  return rawTokens
}

export const useTokensInCurrentNetwork = () => {
  const rawTokens = useTokensInCurrentNetworkIncludingSpam()
  return useTokensWithSpamFilter(rawTokens)
}

export const useTradableTokensInCurrentNetwork = () => {
  const tokens = useTokensInCurrentNetwork()
  const rawTokens = useMemo(
    () => tokens.filter((token) => token.tradable),
    [tokens],
  )
  return useTokensWithSpamFilter(rawTokens)
}

const tokensFamily = atomFamily(
  (baseToken?: BaseToken) => {
    return atom(async (get) => {
      const allTokens = await get(allTokensView)
      return allTokens.find((token) => equalToken(token, baseToken))
    })
  },
  (a, b) => equalToken(a, b),
)

const tokensInfoFamily = atomFamily(
  (baseToken?: BaseToken) => {
    return atom(async (get) => {
      const allTokensInfo = await get(allTokensInfoView)
      return allTokensInfo.find((token) => equalToken(token, baseToken))
    })
  },
  (a, b) => equalToken(a, b),
)

export const useTokenOnCurrentNetworkByAddress = (address?: Address) => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const baseToken = address
    ? { address, networkId: selectedNetworkId }
    : undefined
  const token = useView(tokensFamily(baseToken))
  return token
}

export type TokensRecord = Record<string, Token>

export const useTokensRecord = ({ cleanHex = false }) => {
  const tokens = useView(allTokensView)

  return useMemo(
    () =>
      tokens.reduce<TokensRecord>((acc, token) => {
        const tokenAddress = cleanHex
          ? num.cleanHex(token.address)
          : token.address

        return {
          ...acc,
          [tokenAddress]: token,
        }
      }, {}),
    [cleanHex, tokens],
  )
}

export const useTokensWithBalance = (account?: BaseWalletAccount) => {
  const tokens = useView(tokensInNetwork(account?.networkId))
  const accountBalances = useView(tokenBalancesForAccountViewFamily(account))

  const rawTokens = useMemo(() => {
    return tokens
      .map((token) => {
        const balance = accountBalances.find((balance) =>
          isEqualAddress(balance.address, token.address),
        )?.balance
        return {
          ...token,
          balance: BigInt(balance ?? 0n),
        }
      })
      .filter(
        (token) => token.showAlways || (token.balance && token.balance > 0n),
      )
  }, [tokens, accountBalances])

  return useTokensWithSpamFilter(rawTokens)
}

export const useToken: UseToken = ({ address, networkId }) => {
  return useView(
    tokensFamily({
      address: address as Address,
      networkId,
    }),
  )
}

export const useTokenInfo: UseToken = ({ address, networkId }) => {
  return useView(
    tokensInfoFamily({
      address: address as Address,
      networkId,
    }),
  )
}

export const useTokensWithSpamFilter = <T extends Token>(tokens: T[]): T[] => {
  const hideSpamTokens = useKeyValueStorage(settingsStore, "hideSpamTokens")
  return useMemo(() => {
    if (!hideSpamTokens) {
      return tokens
    }
    return tokens.filter((token) => !token.tags?.includes("scam"))
  }, [hideSpamTokens, tokens])
}
