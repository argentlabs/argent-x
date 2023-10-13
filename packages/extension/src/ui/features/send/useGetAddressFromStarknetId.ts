import { StarknetID, isStarknetId, isValidAddress } from "@argent/shared"
import { debounce } from "lodash-es"
import { useEffect, useRef, useState } from "react"

import { getAddressFromStarkName } from "../../services/useStarknetId"
import { genericErrorSchema } from "../actions/feeEstimation/feeError"

/** TODO: refactor - this should be a chain-agnostic name-resolving service? */

export const useGetAddressFromStarknetId = (
  starknetId: StarknetID,
  networkId: string,
) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [result, setResult] = useState<string | undefined>()
  const cacheKeyToAddress = useRef<Record<string, string>>({}).current
  const resolveStarknetId = async (
    starknetId: StarknetID,
    networkId: string,
  ) => {
    setIsLoading(true)
    try {
      const cacheKey = `${starknetId}::${networkId}`
      let starkNameAddress = cacheKeyToAddress[cacheKey]
      if (!starkNameAddress) {
        starkNameAddress = await getAddressFromStarkName(starknetId, networkId)
      }
      cacheKeyToAddress[cacheKey] = starkNameAddress
      setResult(starkNameAddress)
      setError(undefined)
    } catch (e) {
      setResult(undefined)
      const genericError = genericErrorSchema.safeParse(e)
      if (genericError.success) {
        setError(genericError.data.message)
      } else {
        setError(`Error resolving ${starknetId} - ${e}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const debounceResolveStarknetId = useRef(
    debounce(
      async (starknetId: StarknetID, networkId: string) =>
        resolveStarknetId(starknetId, networkId),
      500,
    ),
  ).current

  useEffect(() => {
    if (isStarknetId(starknetId)) {
      void debounceResolveStarknetId(starknetId, networkId)
    }
  }, [debounceResolveStarknetId, starknetId, networkId])

  /** reset the result immediately on starknetId or networkId change */
  useEffect(() => {
    setResult(undefined)
  }, [starknetId, networkId, setResult])

  const isValid = result ? isValidAddress(result) : false

  return {
    isLoading,
    error,
    result,
    isValid,
    starknetIdToAddress: cacheKeyToAddress,
  }
}
