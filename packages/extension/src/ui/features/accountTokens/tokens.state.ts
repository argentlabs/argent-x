import { useMemo } from "react"
import { num } from "starknet"

import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import {
  allTokensView,
  allTokensInfoView,
  networkFeeTokensOnNetworkFamily,
  allTokenPricesView,
} from "../../views/token"
import type {
  BaseToken,
  Token,
} from "../../../shared/token/__new/types/token.model"
import type { Address } from "@argent/x-shared"
import { isEqualAddress } from "@argent/x-shared"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import {
  atomFamilyTokenEqual,
  equalToken,
} from "../../../shared/token/__new/utils"
import {
  tokenBalancesForAccountViewFamily,
  tokenBalancesForNetworkViewFamily,
} from "../../views/tokenBalances"
import { atomFamily } from "jotai/utils"
import type { UseToken } from "@argent/x-ui"
import { selectedNetworkIdView } from "../../views/network"
import { atom } from "jotai"
import type {
  BaseTokenWithBalance,
  TokenWithOptionalBigIntBalance,
} from "../../../shared/token/__new/types/tokenBalance.model"
import {
  defiDecompositionTokenBalancesForNetworkViewAtom,
  defiDecompositionTokenBalancesViewAtom,
} from "../../views/investments"

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
  return useTokensWithHiddenFilter(rawTokens)
}

export const useTradableTokensInCurrentNetwork = () => {
  const tokens = useTokensInCurrentNetwork()
  const rawTokens = useMemo(
    () => tokens.filter((token) => token.tradable),
    [tokens],
  )
  return useTokensWithHiddenFilter(rawTokens)
}

export const tokensFindFamily = atomFamily((baseToken?: BaseToken) => {
  return atom(async (get) => {
    const allTokens = await get(allTokensView)
    return allTokens.find((token) => equalToken(token, baseToken))
  })
}, atomFamilyTokenEqual)

export const tokensInfoFindFamily = atomFamily((baseToken?: BaseToken) => {
  return atom(async (get) => {
    const allTokensInfo = await get(allTokensInfoView)
    return allTokensInfo.find((token) => equalToken(token, baseToken))
  })
}, atomFamilyTokenEqual)

export const tokensPricesFindFamily = atomFamily((baseToken?: BaseToken) => {
  return atom(async (get) => {
    const allTokensPrices = await get(allTokenPricesView)
    return allTokensPrices.find((token) => equalToken(token, baseToken))
  })
}, atomFamilyTokenEqual)

export const useTokenOnCurrentNetworkByAddress = (address?: Address) => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const baseToken = address
    ? { address, networkId: selectedNetworkId }
    : undefined
  const token = useView(tokensFindFamily(baseToken))
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

const useMapToRawTokens = (
  tokens: Token[],
  accountBalances: BaseTokenWithBalance[],
): TokenWithOptionalBigIntBalance[] => {
  return useMemo(() => {
    return accountBalances
      .flatMap((accountBalance) => {
        const token = tokens.find((token) =>
          isEqualAddress(token.address, accountBalance.address),
        )
        if (!token) {
          return []
        }
        return {
          ...token,
          balance: BigInt(accountBalance.balance ?? 0n),
        }
      })
      .filter((token) => token.showAlways || token.balance !== 0n)
  }, [tokens, accountBalances])
}

export const useTokensWithBalanceForAccount = (account?: BaseWalletAccount) => {
  const tokens = useView(tokensInNetwork(account?.networkId))
  const accountTokenBalances = useView(
    tokenBalancesForAccountViewFamily(account),
  )
  const accountDefiTokenBalances = useView(
    defiDecompositionTokenBalancesViewAtom(account),
  )
  const accountBalances = accountTokenBalances.concat(accountDefiTokenBalances)
  const rawTokens = useMapToRawTokens(tokens, accountBalances)
  return useTokensWithHiddenFilter(rawTokens)
}

export const useTokensWithBalanceForNetwork = (networkId: string) => {
  const tokens = useView(tokensInNetwork(networkId))
  const networkTokenBalances = useView(
    tokenBalancesForNetworkViewFamily(networkId),
  )
  const networkDefiTokenBalances = useView(
    defiDecompositionTokenBalancesForNetworkViewAtom(networkId),
  )
  const networkBalances = networkTokenBalances.concat(networkDefiTokenBalances)
  const rawTokens = useMapToRawTokens(tokens, networkBalances)
  return useTokensWithHiddenFilter(rawTokens)
}

export const useToken: UseToken = ({
  address,
  networkId,
}: Partial<BaseWalletAccount>) => {
  const payload =
    address && networkId
      ? { address: address as Address, networkId }
      : undefined
  return useView(tokensFindFamily(payload))
}

export const useTokenInfo = ({
  address,
  networkId,
}: Partial<BaseWalletAccount>) => {
  const payload =
    address && networkId
      ? { address: address as Address, networkId }
      : undefined
  return useView(tokensInfoFindFamily(payload))
}

export const useTokensWithHiddenFilter = <T extends Token>(
  tokens: T[],
): T[] => {
  return useMemo(() => tokens.filter((token) => !token.hidden), [tokens])
}
