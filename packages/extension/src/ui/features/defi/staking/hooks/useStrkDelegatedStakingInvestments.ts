import type { StrkDelegatedStakingInvestment } from "@argent/x-shared"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { useCallback, useMemo } from "react"
import useSWR from "swr"

import { investmentService } from "../../../../services/investments"

export const selectedStrkDelegatedStakingInvestment = atomWithStorage<
  string | null
>("selectedStrkDelegatedStakingInvestment", null)

export const useStrkDelegatedStakingInvestments = () => {
  return useSWR("stkDelegatedStakingInvestments", () =>
    investmentService.getStrkDelegatedStakingInvestments(),
  )
}

export const useSelectedStrkDelegatedStakingInvestment = (
  investmentId?: string,
): [
  StrkDelegatedStakingInvestment | undefined,
  (investment: StrkDelegatedStakingInvestment) => void,
  () => void,
] => {
  const [storageValue, setStorageValue] = useAtom(
    selectedStrkDelegatedStakingInvestment,
  )
  const { data: investments } = useStrkDelegatedStakingInvestments()

  // when selecting an investment, we store the id in the atom because we need the state to be persisted across the routes changes
  const selectInvestment = useCallback(
    (investment: StrkDelegatedStakingInvestment) => {
      setStorageValue(investment.id)
    },
    [setStorageValue],
  )

  const defaultInvestment = useMemo(
    () =>
      investments?.find(
        (investment) => investment.stakerInfo?.name?.toLowerCase() === "argent",
      ) || investments?.[0],
    [investments],
  )

  // we need to reset the atom to the default value when leaving the provider select screen so that we can have Argent as default provider when we get to the staking screen again
  const resetToDefaultInvestment = useCallback(() => {
    setStorageValue(defaultInvestment?.id ?? null)
  }, [defaultInvestment, setStorageValue])

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
      return defaultInvestment
    }
    const investment = investments.find(
      (investment) => investment.id === storageValue,
    )
    if (investment) {
      return investment
    }
    return undefined
  }, [defaultInvestment, investmentId, investments, storageValue])

  return [investment, selectInvestment, resetToDefaultInvestment]
}
