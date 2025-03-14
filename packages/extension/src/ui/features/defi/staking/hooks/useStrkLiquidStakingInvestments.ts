import type { LiquidStakingInvestment } from "@argent/x-shared"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { useCallback, useMemo } from "react"
import useSWR from "swr"

import { investmentService } from "../../../../services/investments"

export const selectedStrkLiquidStakingInvestment = atomWithStorage<
  string | null
>("selectedStrkLiquidStakingInvestment", null)

export const useStrkLiquidStakingInvestments = () => {
  return useSWR("stkLiquidStakingInvestments", () =>
    investmentService.getStrkLiquidStakingInvestments(),
  )
}

export const useSelectedLiquidStakingInvestment = (
  investmentId?: string,
): [
  LiquidStakingInvestment | undefined,
  (investment: LiquidStakingInvestment) => void,
  () => void,
] => {
  const [storageValue, setStorageValue] = useAtom(
    selectedStrkLiquidStakingInvestment,
  )
  const { data: investments } = useStrkLiquidStakingInvestments()

  // when selecting an investment, we store the id in the atom because we need the state to be persisted across the routes changes
  const selectInvestment = useCallback(
    (investment: LiquidStakingInvestment) => {
      setStorageValue(investment.id)
    },
    [setStorageValue],
  )

  // we need to reset the atom to the default value when leaving the provider select screen so that we can have Argent as default provider when we get to the staking screen again
  const resetToDefaultInvestment = useCallback(() => {
    setStorageValue(investments?.[0]?.id ?? null)
  }, [investments, setStorageValue])

  const investment = useMemo(() => {
    if (!investments?.length) {
      return undefined
    }
    if (investmentId) {
      const investment = investments.find((inv) => inv.id === investmentId)
      if (investment) {
        return investment
      }
    } else if (storageValue === null) {
      return investments[0]
    }
    const investment = investments.find(
      (investment) => investment.id === storageValue,
    )
    if (investment) {
      return investment
    }
    return undefined
  }, [investmentId, investments, storageValue])

  return [investment, selectInvestment, resetToDefaultInvestment]
}
