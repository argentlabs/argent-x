import { useCallback, useState } from "react"

import { multisigService } from "../../../services/multisig"

export function useCreatePendingMultisig() {
  const [isError, setIsError] = useState(false)

  const createPendingMultisig = useCallback(async (networkId: string) => {
    try {
      return await multisigService.addPendingAccount(networkId)
    } catch (error) {
      setIsError(true)
    }
  }, [])

  return { createPendingMultisig, isError }
}
