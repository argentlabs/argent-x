import { useMemo } from "react"
import { num } from "starknet"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useView } from "../../views/implementation/react"
import {
  allTokensOnNetworkFamily,
  allTokensView,
  networkFeeTokensOnNetworkFamily,
  tokenFindFamily,
} from "../../views/token"
import { useAccount } from "../accounts/accounts.state"
import { BaseToken, Token } from "../../../shared/token/__new/types/token.model"
import { tokenBalancesForAccountView } from "../../views/tokenBalances"
import { Address, isEqualAddress } from "@argent/x-shared"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { useAppState } from "../../app.state"
import { accountsEqual } from "../../../shared/utils/accountsEqual"

export const useNetworkFeeTokens = (networkId?: string) => {
  const feeTokens = useView(networkFeeTokensOnNetworkFamily(networkId))
  return feeTokens
}

export const useTokensInNetwork = (networkId?: string) =>
  useView(allTokensOnNetworkFamily(networkId))

export const useTokensInCurrentNetwork = () => {
  const currentNetwork = useCurrentNetwork()
  return useTokensInNetwork(currentNetwork?.id ?? "")
}

export const useTradableTokensInCurrentNetwork = () => {
  const tokens = useTokensInCurrentNetwork()
  return useMemo(() => tokens.filter((token) => token.tradable), [tokens])
}

export const useToken = (baseToken?: BaseToken): Token | undefined => {
  return useView(tokenFindFamily(baseToken))
}

export const useTokenOnCurrentNetworkByAddress = (address?: Address) => {
  const { switcherNetworkId } = useAppState()
  const baseToken = address
    ? { address, networkId: switcherNetworkId }
    : undefined
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
  const balances = useView(tokenBalancesForAccountView(account))

  const accountBalances = useMemo(
    () =>
      balances?.filter((balance) => accountsEqual(balance.account, account)),
    [account, balances],
  )

  return useMemo(() => {
    return tokensInNetwork
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
  }, [tokensInNetwork, accountBalances])
}

export const useTokenBalance = (
  tokenAddress?: Address,
  account?: BaseWalletAccount,
) => {
  const balances = useTokensWithBalance(account)

  return useMemo(() => {
    return balances.find((balance) =>
      isEqualAddress(balance.address, tokenAddress),
    )
  }, [balances, tokenAddress])
}
