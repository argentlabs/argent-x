import { useState } from "react"

import { createNewMultisigAccount } from "../../../../services/backgroundAccounts"

export const useCreateMultisig = () => {
  const [isError, setIsError] = useState(false)
  const createMultisigAccount = async ({
    signers,
    networkId,
    threshold,
  }: {
    signers: string[]
    networkId: string
    threshold: number
  }) => {
    const result = await createNewMultisigAccount(networkId, {
      signers,
      threshold,
    })
    if (result === "error") {
      setIsError(true)
    } else {
      return result
    }
  }
  return { createMultisigAccount, isError }
}
