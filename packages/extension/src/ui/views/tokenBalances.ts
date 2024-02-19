import { atomFamily } from "jotai/utils"
import { atom } from "jotai"
import { tokenBalanceRepo } from "../../shared/token/__new/repository/tokenBalance"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/utils/accountsEqual"
import { BaseToken } from "../../shared/token/__new/types/token.model"
import { equalToken } from "../../shared/token/__new/utils"
import { networkFeeTokensOnNetworkFamily } from "./token"

const tokenBalancesAtom = atomFromRepo(tokenBalanceRepo)

export const tokenBalancesView = atom(async (get) => {
  const tokenBalances = await get(tokenBalancesAtom)
  return tokenBalances
})

export const tokenBalancesForAccountView = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      const tokenBalances = await get(tokenBalancesView)
      return tokenBalances.filter((tokenBalance) =>
        accountsEqual(tokenBalance.account, account),
      )
    })
  },
  (a, b) => accountsEqual(a, b),
)

export const tokenBalanceForAccountAndTokenView = atomFamily(
  ({ account, token }: { account?: BaseWalletAccount; token?: BaseToken }) => {
    return atom(async (get) => {
      const tokenBalances = await get(tokenBalancesView)
      return tokenBalances.find(
        (tokenBalance) =>
          accountsEqual(tokenBalance.account, account) &&
          equalToken(tokenBalance, token),
      )
    })
  },
  (a, b) => accountsEqual(a.account, b.account) && equalToken(a.token, b.token),
)

export const tokenBalanceForTokenView = atomFamily(
  (token?: BaseToken) => {
    return atom(async (get) => {
      const tokenBalances = await get(tokenBalancesView)
      return tokenBalances.find((tokenBalance) =>
        equalToken(tokenBalance, token),
      )
    })
  },
  (a, b) => equalToken(a, b),
)

export const feeTokenBalancesView = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      const tokenBalances = await get(tokenBalancesForAccountView(account))
      if (!account || !tokenBalances) {
        return
      }
      const feeTokens = await get(
        networkFeeTokensOnNetworkFamily(account.networkId),
      )
      if (!feeTokens) {
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
    })
  },
  (a, b) => accountsEqual(a, b),
)
