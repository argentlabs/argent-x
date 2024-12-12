import type {
  ApiStrkDelegatedStaking,
  ApiDefiDecompositionProduct,
  Address,
} from "@argent/x-shared"
import { isStrkDelegatedStaking } from "@argent/x-shared"
import type { BaseWalletAccount } from "../../wallet.model"
import type {
  ParsedStrkDelegatedStakingPosition,
  PositionBaseToken,
} from "../schema"

export const parseStrkDelegatedStakingPositions = (
  product: ApiDefiDecompositionProduct,
  account: BaseWalletAccount,
): ParsedStrkDelegatedStakingPosition[] => {
  if (
    product.type !== "strkDelegatedStaking" ||
    product.positions.length === 0
  ) {
    return []
  }

  const positions = product.positions as ApiStrkDelegatedStaking[]

  const parsedPositions: ParsedStrkDelegatedStakingPosition[] = positions
    .map((position) => {
      if (!isStrkDelegatedStaking(position)) {
        return
      }

      const { id, data, totalBalances, investmentId } = position
      const {
        stakerInfo,
        accruedRewards,
        apy,
        totalApy,
        pendingWithdrawal,
        stakedAmount,
      } = data

      const tokens: PositionBaseToken[] = []

      Object.entries(totalBalances).map(([address, balance]) => {
        tokens.push({
          address: address as Address,
          balance,
          networkId: account.networkId,
        })
      })

      // only one token is expected
      if (tokens.length !== 1) {
        return
      }

      return {
        id,
        investmentId,
        stakerInfo,
        accruedRewards,
        stakedAmount,
        apy,
        totalApy,
        token: tokens[0],
        pendingWithdrawal,
      }
    })
    .filter((position) => position !== undefined)

  return parsedPositions
}
