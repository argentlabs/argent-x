import { BaseWalletAccount } from "../../shared/wallet.model"
import { BaseToken } from "../../shared/token/__new/types/token.model"
import { equalToken } from "../../shared/token/__new/utils"
import { isEqualAddress } from "@argent/x-shared"
import { useNetworkFeeTokens } from "../features/accountTokens/tokens.state"
import { atomFamily } from "jotai/utils"
import { atomFamilyAccountsEqual } from "../../shared/utils/accountsEqual"
import { useView } from "./implementation/react"
import { atom } from "jotai"
import { allTokenBalancesView } from "./token"

export const tokenBalancesForAccountViewFamily = atomFamily(
  (account?: BaseWalletAccount) => {
    const accountAddress = account?.address
    const networkId = account?.networkId

    return atom(async (get) => {
      const allTokenBalances = await get(allTokenBalancesView)
      return allTokenBalances.filter(
        (tokenBalance) =>
          tokenBalance.networkId === networkId &&
          isEqualAddress(tokenBalance.account, accountAddress),
      )
    })
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

    return atom(async (get) => {
      const allTokenBalances = await get(allTokenBalancesView)
      return allTokenBalances.find(
        (tokenBalance) =>
          networkId === tokenBalance.networkId &&
          isEqualAddress(tokenBalance.account, accountAddress) &&
          equalToken(tokenBalance, token),
      )
    })
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
