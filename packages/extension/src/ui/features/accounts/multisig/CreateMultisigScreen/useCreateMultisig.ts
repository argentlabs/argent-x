import { useState } from "react"

import { createNewAccount } from "../../../../services/backgroundAccounts"

export const useCreateMultisig = () => {
  const [isError, setIsError] = useState(false)
  const createMultisigAccount = async ({
    signers,
    networkId,
    threshold,
  }: {
    signers: string[]
    networkId: string
    threshold: string
  }) => {
    const result = await createNewAccount(networkId, "multisig", {
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
