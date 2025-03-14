import type { ApiStaking, ApiDefiDecompositionProduct } from "@argent/x-shared"
import { isStaking } from "@argent/x-shared"
import type { BaseWalletAccount } from "../../wallet.model"
import type { ParsedStakingPosition, PositionBaseToken } from "../schema"

export const parseStakingPositions = (
  product: ApiDefiDecompositionProduct,
  account: BaseWalletAccount,
): ParsedStakingPosition[] => {
  if (product.type !== "staking" || product.positions.length === 0) {
    return []
  }

  const positions = product.positions as ApiStaking[]

  const parsedPositions = positions
    .map<ParsedStakingPosition | undefined>((position) => {
      if (!isStaking(position)) {
        return
      }

      const { data, totalBalances, tokenAddress } = position
      const { apy, totalApy } = data

      const tokens: PositionBaseToken[] = []

      Object.entries(totalBalances).map(([address, balance]) => {
        tokens.push({
          address: address as `0x${string}`,
          balance,
          networkId: account.networkId,
        })
      })

      // only one token is expected
      if (tokens.length !== 1) {
        return
      }

      const liquidityToken = tokenAddress && {
        address: tokenAddress,
        networkId: account.networkId,
      }

      return {
        id: position.id,
        apy,
        totalApy,
        token: tokens[0],
        liquidityToken,
        investmentId: position.investmentId,
      }
    })
    .filter(
      (position): position is ParsedStakingPosition => position !== undefined,
    )

  return parsedPositions
}
