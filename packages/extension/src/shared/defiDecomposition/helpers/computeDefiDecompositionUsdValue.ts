import type { BigDecimal, Token } from "@argent/x-shared"
import { bigDecimal } from "@argent/x-shared"
import type {
  ParsedCollateralizedDebtBorrowingPosition,
  ParsedCollateralizedDebtLendingPosition,
  ParsedConcentratedLiquidityPosition,
  ParsedDefiDecomposition,
  ParsedDefiDecompositionWithUsdValue,
  ParsedDelegatedTokensPosition,
  ParsedProduct,
  ParsedProductWithUsdValue,
  ParsedStakingPosition,
  ParsedStrkDelegatedStakingPosition,
} from "../schema"
import {
  computeCollateralizedDebtBorrowingPositionsUsdValue,
  computeCollateralizedDebtLendingPositionsUsdValue,
} from "./computeCollateralizedDebtPositionsUsdValue"
import { computeConcentratedLiquidityPositionsUsdValue } from "./computeConcentratedLiquidityPositionsUsdValue"
import { computeDelegatedTokensPositionsUsdValue } from "./computeDelegatedTokensPositionsUsdValue"
import { computeStakingPositionsUsdValue } from "./computeStakingPositionsUsdValue"
import { computeStrkDelegatedStakingPositionsUsdValue } from "./computeStrkDelegatedStakingPositionsUsdValue"
import type { TokenPriceDetails } from "../../token/__new/types/tokenPrice.model"
import { sortDescendingByUsdValue } from "./sortDescendingByUsdValue"

const computeProductUsdValue = (
  product: ParsedProduct,
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedProductWithUsdValue => {
  let positionsWithUsdValue
  let totalUsdValue: BigDecimal = bigDecimal.parseUnits("0")
  switch (product.type) {
    case "concentratedLiquidityPosition":
      positionsWithUsdValue = computeConcentratedLiquidityPositionsUsdValue(
        product.positions as ParsedConcentratedLiquidityPosition[],
        tokens,
        tokenPrices,
      )
      totalUsdValue = bigDecimal.add(
        totalUsdValue,
        bigDecimal.parseUnits(positionsWithUsdValue.totalUsdValue),
      )
      break
    case "collateralizedDebtLendingPosition":
      positionsWithUsdValue = computeCollateralizedDebtLendingPositionsUsdValue(
        product.positions as ParsedCollateralizedDebtLendingPosition[],
        tokens,
        tokenPrices,
      )
      totalUsdValue = bigDecimal.add(
        totalUsdValue,
        bigDecimal.parseUnits(positionsWithUsdValue.totalUsdValue),
      )
      break
    case "collateralizedDebtBorrowingPosition":
      positionsWithUsdValue =
        computeCollateralizedDebtBorrowingPositionsUsdValue(
          product.positions as ParsedCollateralizedDebtBorrowingPosition[],
          tokens,
          tokenPrices,
        )
      totalUsdValue = bigDecimal.add(
        totalUsdValue,
        bigDecimal.parseUnits(positionsWithUsdValue.totalUsdValue),
      )
      break
    case "delegatedTokens":
      positionsWithUsdValue = computeDelegatedTokensPositionsUsdValue(
        product.positions as ParsedDelegatedTokensPosition[],
        tokens,
        tokenPrices,
      )
      totalUsdValue = bigDecimal.add(
        totalUsdValue,
        bigDecimal.parseUnits(positionsWithUsdValue.totalUsdValue),
      )
      break
    case "strkDelegatedStaking":
      positionsWithUsdValue = computeStrkDelegatedStakingPositionsUsdValue(
        product.positions as ParsedStrkDelegatedStakingPosition[],
        tokens,
        tokenPrices,
      )

      totalUsdValue = bigDecimal.add(
        totalUsdValue,
        bigDecimal.parseUnits(positionsWithUsdValue.totalUsdValue),
      )
      break
    case "staking":
      positionsWithUsdValue = computeStakingPositionsUsdValue(
        product.positions as ParsedStakingPosition[],
        tokens,
        tokenPrices,
      )
      totalUsdValue = bigDecimal.add(
        totalUsdValue,
        bigDecimal.parseUnits(positionsWithUsdValue.totalUsdValue),
      )
      break
    default:
      positionsWithUsdValue = { totalUsdValue: "0", positions: [] }
  }

  return {
    ...product,
    positions: positionsWithUsdValue.positions,
    totalUsdValue: bigDecimal.formatUnits(totalUsdValue),
  }
}

export const computeDefiDecompositionUsdValue = (
  defiDecomposition: ParsedDefiDecomposition,
  tokens: Token[],
  tokenPrices: TokenPriceDetails[],
): ParsedDefiDecompositionWithUsdValue => {
  const dappsWithUsdValue = defiDecomposition.map((dapp) => {
    let totalUsdValue: BigDecimal = bigDecimal.parseUnits("0")
    const productsWithUsdValue = dapp.products.map((product) => {
      const productWithUsdValue = computeProductUsdValue(
        product,
        tokens,
        tokenPrices,
      )
      totalUsdValue = bigDecimal.add(
        totalUsdValue,
        bigDecimal.parseUnits(productWithUsdValue.totalUsdValue),
      )
      return productWithUsdValue
    })

    // Sort products by totalUsdValue in descending order
    const sortedProductsWithUsdValue = productsWithUsdValue
      .filter((p) => p.positions.length)
      .sort(sortDescendingByUsdValue)

    return {
      ...dapp,
      products: sortedProductsWithUsdValue,
      totalUsdValue: bigDecimal.formatUnits(totalUsdValue),
    }
  })

  // Sort dapps by totalUsdValue in descending order
  const sortedDappsWithUsdValue = dappsWithUsdValue
    .filter((dapp) => dapp.products.length)
    .sort(sortDescendingByUsdValue)

  return sortedDappsWithUsdValue
}
