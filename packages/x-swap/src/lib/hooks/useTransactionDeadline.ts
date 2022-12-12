import { BigNumber } from "ethers"
import { useMemo } from "react"

import { DEFAULT_DEADLINE_FROM_NOW } from "../constants"
import useCurrentBlockTimestamp from "./useCurrentBlockTimestamp"

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    if (blockTimestamp) {
      return BigNumber.from(blockTimestamp).add(DEFAULT_DEADLINE_FROM_NOW)
    }
    return undefined
  }, [blockTimestamp])
}
