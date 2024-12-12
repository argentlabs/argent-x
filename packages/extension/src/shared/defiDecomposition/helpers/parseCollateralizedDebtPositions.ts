import type {
  Address,
  ApiCollateralizedDebtPosition,
  ApiDefiDecompositionProduct,
} from "@argent/x-shared"
import { isCollateralizedDebtPosition } from "@argent/x-shared"
import { groupBy } from "lodash-es"
import type { BaseWalletAccount } from "../../wallet.model"
import type {
  ParsedCollateralizedDebtBorrowingPosition,
  ParsedCollateralizedDebtLendingPosition,
  PositionBaseToken,
} from "../schema"

export const parseCollateralizedDebtPositions = (
  product: ApiDefiDecompositionProduct,
  account: BaseWalletAccount,
): {
  lending: ParsedCollateralizedDebtLendingPosition[]
  borrowing: ParsedCollateralizedDebtBorrowingPosition[]
} => {
  if (
    product.type !== "collateralizedDebtPosition" ||
    product.positions.length === 0
  ) {
    return {
      lending: [],
      borrowing: [],
    }
  }

  const positions = product.positions as ApiCollateralizedDebtPosition[]

  const parsedPositions: ParsedCollateralizedDebtLendingPosition[] = positions
    .map((position) => {
      if (!isCollateralizedDebtPosition(position)) {
        return
      }

      const { id, data, totalBalances, tokenAddress } = position
      const { collateral, debt, lending, apy, group, totalApy } = data

      const tokens: PositionBaseToken[] = []

      Object.entries(totalBalances).map(([address, balance]) => {
        tokens.push({
          address: address as Address,
          // don't store the negative value
          balance: balance.startsWith("-") ? balance.slice(1) : balance,
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
        id,
        lending,
        apy,
        totalApy,
        group: `${group}`,
        collateral,
        debt,
        token: tokens[0],
        liquidityToken,
      }
    })
    .filter((position) => position !== undefined)

  const lendingPositions = parsedPositions.filter(
    (position) => position.lending && !position.debt && !position.collateral,
  )

  // Group positions by their group
  const groupedPositions = groupBy(parsedPositions, "group")

  // Process each group
  const processedGroups = Object.entries(groupedPositions)
    .map(([group, positions]) => {
      if (isNaN(Number(group))) {
        return
      }
      const collateralizedPositions = positions.filter((p) => p.collateral)
      const debtPositions = positions.filter((p) => p.debt)

      return {
        id: positions[0].id,
        group,
        healthRatio: product.groups?.[group]?.healthRatio,
        collateralizedPositions,
        debtPositions,
      }
    })
    .filter(
      <T>(x: T): x is NonNullable<T> => x !== undefined && x !== null, // needed or typescript will complain
    )

  return {
    lending: lendingPositions,
    borrowing: processedGroups,
  }
}
