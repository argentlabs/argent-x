import { convertTokenAmountToCurrencyValue } from "@argent/x-shared"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import {
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "../../shared/defiDecomposition/schema"
import { equalToken } from "../../shared/token/__new/utils"
import { atomFamilyAccountsEqual } from "../../shared/utils/accountsEqual"
import { tokensFindFamily } from "../features/accountTokens/tokens.state"
import type { AccountAndPositionIdFamily } from "./investments"
import { investmentPositionViewFindByIdAtom } from "./investments"
import { allTokenPricesView } from "./token"
import { tokenBalancesForAccountAndTokenView } from "./tokenBalances"

export interface StrkDelegatedBalance {
  stakedAmount: string
  rewards?: string
  total: string
}

export const strkDelegatedStakingPositionUsdValueAtom = atomFamily(
  ({ positionId, account }: AccountAndPositionIdFamily) =>
    atom(async (get) => {
      if (!account || !positionId) return

      // Get the position from the investment
      const position = await get(
        investmentPositionViewFindByIdAtom({ positionId }),
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

export const liquidStakingPositionUsdValueAtom = atomFamily(
  ({ positionId, account }: AccountAndPositionIdFamily) =>
    atom(async (get) => {
      if (!account || !positionId) return

      // Get the position from the investment
      const position = await get(
        investmentPositionViewFindByIdAtom({ positionId }),
      )

      if (!position || !isStakingPosition(position)) return

      // Get the tokenInfo
      const token = await get(tokensFindFamily(position.token))
      if (!token) return

      const liquidityToken = await get(
        tokensFindFamily(position.liquidityToken),
      )
      if (!liquidityToken) return

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

      const totalUsdValue = convertTokenAmountToCurrencyValue({
        amount: position.token.balance,
        decimals: token.decimals,
        unitCurrencyValue: tokenPrice.ccyValue,
      })

      const liquidityTokenWithBalance = await get(
        tokenBalancesForAccountAndTokenView({ account, token: liquidityToken }),
      )

      const liquidityTokenBalance =
        liquidityTokenWithBalance?.balance?.toString() ?? "0"

      const balance = {
        stakedAmount: liquidityTokenBalance,
        total: position.token.balance,
      }

      const usdValue = {
        stakedAmount: balanceUsdValue ?? "0",
        total: totalUsdValue ?? "0",
      }

      return {
        position,
        token,
        liquidityToken,
        balance,
        usdValue,
      }
    }),
  (a, b) =>
    a.positionId === b.positionId &&
    atomFamilyAccountsEqual(a.account, b.account),
)
