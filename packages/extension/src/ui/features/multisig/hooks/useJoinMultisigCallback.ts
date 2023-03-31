import { useCallback, useState } from "react"

import { createNewPendingMultisig } from "../../../services/backgroundMultisigs"

export function useCreatePendingMultisig() {
  const [isError, setIsError] = useState(false)

  const createPendingMultisig = useCallback(async (networkId: string) => {
    const result = await createNewPendingMultisig(networkId)

    if (result === "error") {
      setIsError(true)
    } else {
      return result
    }
  }, [])

  return { createPendingMultisig, isError }
}
