import { atomFamily } from "jotai/utils"
import { atom } from "jotai"
import { tokenBalanceRepo } from "../../shared/token/__new/repository/tokenBalance"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/utils/accountsEqual"
import { BaseToken } from "../../shared/token/__new/types/token.model"
import { equalToken } from "../../shared/token/__new/utils"
import { networkFeeTokenOnNetworkFamily } from "./token"

const tokenBalancesAtom = atomFromRepo(tokenBalanceRepo)

export const tokenBalancesView = atom(async (get) => {
  const tokenBalances = await get(tokenBalancesAtom)
  return tokenBalances
})

export const tokenBalanceForAccountView = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      const tokenBalances = await get(tokenBalancesView)
      if (!account) {
        return
      }
      return tokenBalances.filter((tokenBalance) =>
        accountsEqual(tokenBalance.account, account),
      )
    })
  },
  (a, b) => !!a && !!b && accountsEqual(a, b),
)

export const tokenBalanceForTokenView = atomFamily(
  (token?: BaseToken) => {
    return atom(async (get) => {
      const tokenBalances = await get(tokenBalancesView)
      if (!token) {
        return
      }
      return tokenBalances.filter((tokenBalance) =>
        equalToken(tokenBalance, token),
      )
    })
  },
  (a, b) => !!a && !!b && equalToken(a, b),
)

export const feeTokenBalanceView = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      const tokenBalances = await get(tokenBalanceForAccountView(account))
      if (!account || !tokenBalances) {
        return
      }
      const feeToken = await get(
        networkFeeTokenOnNetworkFamily(account.networkId),
      )
      return tokenBalances.find(
        (tokenBalance) => feeToken && equalToken(tokenBalance, feeToken),
      )
    })
  },
  (a, b) => !!a && !!b && accountsEqual(a, b),
)
