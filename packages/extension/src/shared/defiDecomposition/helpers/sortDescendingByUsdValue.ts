import { bigDecimal } from "@argent/x-shared"

type SortDescendingByUsdValueParam =
  | { totalUsdValue: string }
  | { token: { usdValue: string } }

export const sortDescendingByUsdValue = (
  a: SortDescendingByUsdValueParam,
  b: SortDescendingByUsdValueParam,
) => {
  const aValue = "totalUsdValue" in a ? a.totalUsdValue : a.token.usdValue
  const bValue = "totalUsdValue" in b ? b.totalUsdValue : b.token.usdValue
  return bigDecimal.gte(
    bigDecimal.parseUnits(bValue),
    bigDecimal.parseUnits(aValue),
  )
    ? 1
    : -1
}
