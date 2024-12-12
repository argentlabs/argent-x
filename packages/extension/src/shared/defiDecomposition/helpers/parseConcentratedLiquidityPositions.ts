import type {
  ApiConcentratedLiquidityPosition,
  ApiDefiDecompositionProduct,
  ApiDefiDecompositionToken,
  Token,
} from "@argent/x-shared"
import { isConcentratedLiquidityPosition } from "@argent/x-shared"
import type { BaseWalletAccount } from "../../wallet.model"
import type {
  ParsedConcentratedLiquidityPosition,
  ParsedConcentratedLiquidityToken,
} from "../schema"
import { equalToken } from "../../token/__new/utils"

export const parseConcentratedLiquidityPositions = (
  product: ApiDefiDecompositionProduct,
  account: BaseWalletAccount,
  tokens: Token[],
): ParsedConcentratedLiquidityPosition[] => {
  if (
    product.type !== "concentratedLiquidityPosition" ||
    product.positions.length === 0
  ) {
    return []
  }

  const positions = product.positions as ApiConcentratedLiquidityPosition[]

  return positions
    .map((position) => {
      if (!isConcentratedLiquidityPosition(position)) {
        return
      }

      const { id, totalBalances, data, tokenAddress } = position
      const { poolFeePercentage, tickSpacingPercentage, token0, token1 } = data

      const parsedToken0 = parseConcentratedLiquidityToken(
        token0,
        account.networkId,
        totalBalances,
        tokens,
      )

      const parsedToken1 = parseConcentratedLiquidityToken(
        token1,
        account.networkId,
        totalBalances,
        tokens,
      )

      if (!parsedToken0 || !parsedToken1) {
        return undefined
      }

      const liquidityToken = tokenAddress && {
        address: tokenAddress,
        networkId: account.networkId,
      }

      return {
        id,
        poolFeePercentage,
        tickSpacingPercentage,
        token0: parsedToken0,
        token1: parsedToken1,
        liquidityToken,
      }
    })
    .filter((position) => position !== undefined)
}

const parseConcentratedLiquidityToken = (
  token: ApiDefiDecompositionToken,
  networkId: string,
  totalBalances: ApiConcentratedLiquidityPosition["totalBalances"],
  tokens: Token[],
): ParsedConcentratedLiquidityToken | undefined => {
  const tokenInfo = tokens.find((t) =>
    equalToken(t, {
      address: token.tokenAddress,
      networkId,
    }),
  )

  if (!tokenInfo) {
    return undefined
  }

  const balance = totalBalances[token.tokenAddress]

  return {
    address: tokenInfo.address,
    networkId: tokenInfo.networkId,
    principal: token.principal,
    accruedFees: token.accruedFees,
    minPrice: token.minPrice,
    maxPrice: token.maxPrice,
    currentPrice: token.currentPrice,
    balance,
  }
}
