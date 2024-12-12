import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import type { AccountAndPositionIdFamily } from "./investments"
import {
  investmentPositionViewFindByIdAtom,
  investmentTypeViewFindAtom,
} from "./investments"
import {
  accountsEqualByAddress,
  atomFamilyAccountsEqual,
} from "../../shared/utils/accountsEqual"
import { isStrkDelegatedStakingPosition } from "../../shared/defiDecomposition/schema"
import { convertTokenAmountToCurrencyValue } from "@argent/x-shared"
import { tokensFindFamily } from "../features/accountTokens/tokens.state"
import { allTokenPricesView } from "./token"
import { equalToken } from "../../shared/token/__new/utils"

export const stakedStrkInvestmentForAccountView = atomFamily(
  (account?: BaseWalletAccount) => {
    return atom(async (get) => {
      const strkInvestments = await get(
        investmentTypeViewFindAtom("strkDelegatedStaking"),
      )
      if (!strkInvestments) return []

      return strkInvestments.filter(({ address, networkId }) =>
        accountsEqualByAddress({ address, networkId }, account),
      )
    })
  },
  atomFamilyAccountsEqual,
)

export interface StrkDelegatedBalance {
  stakedAmount: string
  rewards: string
  total: string
}

export const strkDelegatedStakingPositionUsdValueAtom = atomFamily(
  ({ positionId, account }: AccountAndPositionIdFamily) =>
    atom(async (get) => {
      if (!account || !positionId) return

      // Get the position from the investment
      const position = await get(
        investmentPositionViewFindByIdAtom({ account, positionId }),
      )

      if (!position || !isStrkDelegatedStakingPosition(position)) return

      // Get the tokenInfo
      const token = await get(tokensFindFamily(position.token))
      if (!token) return

      // Get the token balance and price
      const tokenPrices = await get(allTokenPricesView)

      // Compute the USD value
      const tokenPrice = tokenPrices.find((cv) =>
        equalToken(cv, position.token),
      )
      if (!tokenPrice) return

      const balanceUsdValue = convertTokenAmountToCurrencyValue({
        amount: position.token.balance,
        decimals: token.decimals,
        unitCurrencyValue: tokenPrice.ccyValue,
      })

      const accruedRewardsUsdValue = convertTokenAmountToCurrencyValue({
        amount: position.accruedRewards,
        decimals: token.decimals,
        unitCurrencyValue: tokenPrice.ccyValue,
      })

      const totalUsdValue = convertTokenAmountToCurrencyValue({
        amount: position.token.balance,
        decimals: token.decimals,
        unitCurrencyValue: tokenPrice.ccyValue,
      })

      const balance = {
        stakedAmount: position.stakedAmount,
        rewards: position.accruedRewards,
        total: position.token.balance,
      }

      const usdValue = {
        stakedAmount: balanceUsdValue ?? "0",
        rewards: accruedRewardsUsdValue ?? "0",
        total: totalUsdValue ?? "0",
      }

      return {
        position,
        token,
        balance,
        usdValue,
      }
    }),
  (a, b) =>
    a.positionId === b.positionId &&
    atomFamilyAccountsEqual(a.account, b.account),
)
