import { useCallback, useState } from "react"

import { multisigService } from "../../../services/multisig"
import { SignerType } from "../../../../shared/wallet.model"

export function useCreatePendingMultisig() {
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const createPendingMultisig = useCallback(
    async (networkId: string, signerType: SignerType) => {
      try {
        setLoading(true)
        return await multisigService.addPendingAccount(networkId, signerType)
      } catch (error) {
        setIsError(true)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { createPendingMultisig, isError, loading }
}
