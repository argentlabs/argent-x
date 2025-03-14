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
import type { Address, RequiredBy } from "@argent/x-shared"
import { ensureArray, isEqualAddress } from "@argent/x-shared"
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
import { atomWithDebugLabel } from "../../views/atomWithDebugLabel"
import {
  investmentViewFindAtom,
  investmentViewFindAtomByNetworkId,
} from "../../views/investments"

export const useNetworkFeeTokens = (networkId?: string) => {
  const feeTokens = useView(networkFeeTokensOnNetworkFamily(networkId))
  return feeTokens
}

export const tokensInNetwork = atomFamily((networkId?: string) => {
  return atomWithDebugLabel(
    atom(async (get) => {
      const allTokens = await get(allTokensView)
      return allTokens.filter((t) => t.networkId === networkId)
    }),
    `tokensInNetwork(${networkId})`,
  )
})

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

export const isTokenVerified = (token: Token) => {
  return (
    token.tags?.includes("verified") ||
    token.tags?.includes("avnuVerified") ||
    token.tags?.includes("communityVerified")
  )
}

export const tokensFindFamily = atomFamily((baseToken?: BaseToken) => {
  return atomWithDebugLabel(
    atom(async (get) => {
      const allTokens = await get(allTokensView)
      return allTokens.find((token) => equalToken(token, baseToken))
    }),
    `tokensFindFamily(${baseToken?.address})`,
  )
}, atomFamilyTokenEqual)

export const tokensInfoFindFamily = atomFamily((baseToken?: BaseToken) => {
  return atomWithDebugLabel(
    atom(async (get) => {
      const allTokensInfo = await get(allTokensInfoView)
      return allTokensInfo.find((token) => equalToken(token, baseToken))
    }),
    `tokensInfoFindFamily(${baseToken?.address})`,
  )
}, atomFamilyTokenEqual)

export const tokensPricesFindFamily = atomFamily((baseToken?: BaseToken) => {
  return atomWithDebugLabel(
    atom(async (get) => {
      const allTokensPrices = await get(allTokenPricesView)
      return allTokensPrices.find((token) => equalToken(token, baseToken))
    }),
    `tokensPricesFindFamily(${baseToken?.address})`,
  )
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

export const useMapToRawTokens = (
  tokens: Token[],
  accountBalances: BaseTokenWithBalance[],
  hideZeroBalances: boolean = true,
): RequiredBy<TokenWithOptionalBigIntBalance, "balance">[] => {
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
      .filter(
        (token) =>
          token.showAlways || (hideZeroBalances ? token.balance !== 0n : true),
      )
  }, [tokens, accountBalances, hideZeroBalances])
}

export const useTokensWithBalanceForAccount = (account?: BaseWalletAccount) => {
  const tokens = useView(tokensInNetwork(account?.networkId))
  const accountTokenBalances = useView(
    tokenBalancesForAccountViewFamily(account),
  )
  const accountInvestments = useView(investmentViewFindAtom(account))
  const accountBalances = accountTokenBalances.concat(
    ensureArray(accountInvestments?.tokenBalances),
  )
  const rawTokens = useMapToRawTokens(tokens, accountBalances)
  return useTokensWithHiddenFilter(rawTokens)
}

export const useTokensWithBalanceForNetwork = (networkId: string) => {
  const tokens = useView(tokensInNetwork(networkId))
  const networkTokenBalances = useView(
    tokenBalancesForNetworkViewFamily(networkId),
  )
  const networkInvestments = useView(
    investmentViewFindAtomByNetworkId(networkId),
  )
  const networkBalances = networkTokenBalances.concat(
    networkInvestments.flatMap((i) => i.tokenBalances),
  )
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
