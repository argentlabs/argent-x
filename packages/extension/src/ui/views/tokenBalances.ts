import { ensureArray, isEqualAddress } from "@argent/x-shared"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import type { BaseToken } from "../../shared/token/__new/types/token.model"
import { equalToken } from "../../shared/token/__new/utils"
import { atomFamilyAccountsEqual } from "../../shared/utils/accountsEqual"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { useNetworkFeeTokens } from "../features/accountTokens/tokens.state"
import { visibleAccountsOnNetworkFamily } from "./account"
import { useView } from "./implementation/react"
import { allTokenBalancesView } from "./token"
import { atomWithDebugLabel } from "./atomWithDebugLabel"
import {
  investmentViewFindAtom,
  investmentViewFindAtomByNetworkId,
} from "./investments"

export const tokenBalancesForNetworkViewFamily = atomFamily(
  (networkId: string) =>
    atomWithDebugLabel(
      atom(async (get) => {
        const visibleAccounts = await get(
          visibleAccountsOnNetworkFamily(networkId),
        )
        const allTokenBalances = await get(allTokenBalancesView)
        const investmentsInNetwork = await get(
          investmentViewFindAtomByNetworkId(networkId),
        )
        const liquidityTokens = investmentsInNetwork.flatMap(
          (investment) => investment.liquidityTokens,
        )

        return allTokenBalances.filter(
          (tokenBalance) =>
            !liquidityTokens.some((token) => equalToken(token, tokenBalance)) &&
            tokenBalance.networkId === networkId &&
            visibleAccounts.some((visibleAccount) =>
              isEqualAddress(tokenBalance.account, visibleAccount.address),
            ),
        )
      }),
      `tokenBalancesForNetworkViewFamily-${networkId}`,
    ),
)

export const tokenBalancesForAccountViewFamily = atomFamily(
  (account?: BaseWalletAccount) => {
    const accountAddress = account?.address
    const networkId = account?.networkId
    return atomWithDebugLabel(
      atom(async (get) => {
        const allTokenBalances = await get(allTokenBalancesView)
        const investments = await get(investmentViewFindAtom(account))
        const liquidityTokens = ensureArray(investments?.liquidityTokens)

        return allTokenBalances.filter(
          (tokenBalance) =>
            !liquidityTokens.some((token) => equalToken(token, tokenBalance)) &&
            tokenBalance.networkId === networkId &&
            isEqualAddress(tokenBalance.account, accountAddress),
        )
      }),
      `tokenBalancesForAccountViewFamily-${account?.id}`,
    )
  },
  atomFamilyAccountsEqual,
)

interface AccountAndTokenFamily {
  account?: BaseWalletAccount
  token?: BaseToken
}

export const tokenBalancesForAccountAndTokenView = atomFamily(
  ({ account, token }: AccountAndTokenFamily) => {
    const accountAddress = account?.address
    const networkId = account?.networkId

    return atomWithDebugLabel(
      atom(async (get) => {
        const allTokenBalances = await get(allTokenBalancesView)
        return allTokenBalances.find(
          (tokenBalance) =>
            networkId === tokenBalance.networkId &&
            isEqualAddress(tokenBalance.account, accountAddress) &&
            equalToken(tokenBalance, token),
        )
      }),
      `tokenBalancesForAccountAndTokenView-${account?.id}-${token?.address}`,
    )
  },
  (a, b) =>
    atomFamilyAccountsEqual(a?.account, b?.account) &&
    equalToken(a?.token, b?.token),
)

export const useFeeTokenBalancesView = (account?: BaseWalletAccount) => {
  const tokenBalances = useView(tokenBalancesForAccountViewFamily(account))
  const feeTokens = useNetworkFeeTokens(account?.networkId)
  if (!account || !tokenBalances || !feeTokens) {
    return
  }

  return feeTokens.map((feeToken) => {
    const tokenBalance = tokenBalances.find((tokenBalance) =>
      equalToken(tokenBalance, feeToken),
    )
    return {
      ...feeToken,
      balance: tokenBalance?.balance ?? "0",
    }
  })
}
