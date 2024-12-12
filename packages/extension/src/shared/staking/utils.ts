import { bigDecimal, DEFAULT_TOKEN_DECIMALS } from "@argent/x-shared"
import type { ParsedStrkDelegatedStakingPosition } from "../defiDecomposition/schema"
import { getActiveFromNow } from "../utils/getActiveFromNow"

export function checkHasRewards(
  balance: string,
  decimals = DEFAULT_TOKEN_DECIMALS, // decimals don't matter when comparing to 0
) {
  return bigDecimal.gt(
    bigDecimal.parseUnits(balance, decimals),
    bigDecimal.parseUnits("0"),
  )
}

export function isWithdrawAvailable({
  pendingWithdrawal,
}: Pick<ParsedStrkDelegatedStakingPosition, "pendingWithdrawal">) {
  return (
    !!pendingWithdrawal && // Check if there is a pending withdrawal
    getActiveFromNow(pendingWithdrawal.withdrawableAfter).activeFromNowMs === 0 // Check if the withdrawal is available
  )
}
