import { useCallback, useState } from "react"

import { createNewMultisigAccount } from "../../../services/backgroundMultisigs"

export const useCreateMultisig = () => {
  const [isError, setIsError] = useState(false)

  const createMultisigAccount = useCallback(
    async ({
      signers,
      networkId,
      threshold,
      creator,
    }: {
      signers: string[]
      networkId: string
      threshold: number
      creator?: string
    }) => {
      const result = await createNewMultisigAccount(networkId, {
        signers,
        threshold,
        creator,
      })
      if (result === "error") {
        setIsError(true)
      } else {
        return result
      }
    },
    [],
  )
  return { createMultisigAccount, isError }
}
