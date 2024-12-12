import type { ApiDefiPositions } from "@argent/x-shared"
import type { BaseWalletAccount } from "../../wallet.model"
import type {
  ParsedDefiDecomposition,
  ParsedPosition,
  ParsedProduct,
} from "../schema"
import { parseConcentratedLiquidityPositions } from "./parseConcentratedLiquidityPositions"
import { parseCollateralizedDebtPositions } from "./parseCollateralizedDebtPositions"
import { parseDelegatedTokensPositions } from "./parseDelegatedTokensPositions"
import { parseStrkDelegatedStakingPositions } from "./parseStrkDelegatedStakingPositions"
import { parseStakingPositions } from "./parseStakingPositions"
import type { Token } from "../../token/__new/types/token.model"
import { getProductTypeName } from "./getDefiProductName"

export const parseDefiDecomposition = (
  apiDefiPositions: ApiDefiPositions,
  account: BaseWalletAccount,
  tokens: Token[],
): ParsedDefiDecomposition => {
  return apiDefiPositions.dapps.map((dapp) => {
    const parsedProducts: ParsedProduct[] = dapp.products
      .map((product): ParsedProduct[] => {
        let positions: ParsedPosition[] = []

        switch (product.type) {
          case "concentratedLiquidityPosition":
            positions = parseConcentratedLiquidityPositions(
              product,
              account,
              tokens,
            )
            break
          case "collateralizedDebtPosition": {
            const { lending, borrowing } = parseCollateralizedDebtPositions(
              product,
              account,
            )

            const baseProduct = {
              manageUrl: product.manageUrl,
              groups: product.groups,
            }
            const result = []
            if (lending.length) {
              result.push({
                ...baseProduct,
                positions: lending,
                name: getProductTypeName("collateralizedDebtLendingPosition"),
                productId: product.productId + "-lending",
                type: "collateralizedDebtLendingPosition",
              } as ParsedProduct)
            }

            if (borrowing.length) {
              result.push({
                ...baseProduct,
                positions: borrowing,
                name: getProductTypeName("collateralizedDebtBorrowingPosition"),
                productId: product.productId + "-borrowing",
                type: "collateralizedDebtBorrowingPosition",
              } as ParsedProduct)
            }

            return result
          }
          case "delegatedTokens":
            positions = parseDelegatedTokensPositions(product, account)
            break
          case "strkDelegatedStaking":
            positions = parseStrkDelegatedStakingPositions(product, account)
            break
          case "staking":
            positions = parseStakingPositions(product, account)
            break
          default:
            positions = []
        }

        if (!positions.length) {
          return []
        }

        return [
          {
            productId: product.productId,
            type: product.type,
            manageUrl: product.manageUrl,
            name: getProductTypeName(product.type),
            positions,
            groups: product.groups,
          },
        ]
      })
      .flat()

    return {
      dappId: dapp.dappId,
      products: parsedProducts,
    }
  })
}
