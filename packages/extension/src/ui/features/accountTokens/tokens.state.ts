import { keyBy } from "lodash-es"
import { useMemo } from "react"
import { num } from "starknet"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import {
  allTokensOnNetworkFamily,
  allTokensView,
  networkFeeTokenOnNetworkFamily,
  tokenFindFamily,
} from "../../views/token"
import { useAccount } from "../accounts/accounts.state"
import { BaseToken, Token } from "../../../shared/token/__new/types/token.model"
import { tokenBalanceForAccountView } from "../../views/tokenBalances"
import { tokenRepo } from "../../../shared/token/__new/repository/token"
import { networkRepo } from "../../../shared/network/store"

export async function getNetworkFeeToken(networkId?: string) {
  if (!networkId) {
    return null
  }
  const [network] = await networkRepo.get((n) => n.id === networkId)
  if (!network) {
    return null
  }
  const [feeToken] = await tokenRepo.get(
    (token) =>
      token.address === network.feeTokenAddress &&
      token.networkId === network.id,
  )
  return feeToken ?? null
}

export const useNetworkFeeToken = (networkId?: string) => {
  const feeToken = useView(networkFeeTokenOnNetworkFamily(networkId))
  return feeToken
}

export const useTokensInNetwork = (networkId: string) =>
  useView(allTokensOnNetworkFamily(networkId))

export const useToken = (baseToken?: BaseToken): Token | undefined => {
  return useView(tokenFindFamily(baseToken))
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
  const selectedAccount = useAccount(account)
  const networkId = useMemo(() => {
    return selectedAccount?.networkId ?? ""
  }, [selectedAccount?.networkId])
  const tokensInNetwork = useTokensInNetwork(networkId)
  const balances = useView(tokenBalanceForAccountView(account))

  const balancesMap = useMemo(
    () => (balances ? keyBy(balances, "address") : {}),
    [balances],
  )

  return useMemo(() => {
    return tokensInNetwork
      .map((token) => ({
        ...token,
        balance: BigInt(balancesMap[token.address]?.balance ?? 0n),
      }))
      .filter(
        (token) => token.showAlways || (token.balance && token.balance > 0n),
      )
  }, [tokensInNetwork, balancesMap])
}
