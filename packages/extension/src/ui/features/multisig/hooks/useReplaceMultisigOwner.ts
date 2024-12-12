import { decodeBase58 } from "@argent/x-shared"
import { isEmpty } from "lodash-es"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import { multisigService } from "../../../services/multisig"
import type { FieldValuesReplaceOwnerForm } from "./useReplaceOwnerForm"

export const useReplaceMultisigOwner = () => {
  const { trigger, getValues } = useFormContext<FieldValuesReplaceOwnerForm>()

  const replaceMultisigOwner = useCallback(
    async (
      signerToRemove?: string,
      account?: BaseWalletAccount,
      multisigPublicKey?: string,
    ) => {
      const signerToAdd = getValues("signerKey")
      const isValid = await trigger()

      if (isValid && signerToRemove && account?.address) {
        await multisigService.replaceOwner({
          signerToRemove,
          signerToAdd,
          address: account.address,
        })

        const name = getValues("name")

        // need to do name && !isEmpty(name) because the compiler doesn't recognize isEmpty as a type guard
        if (name && !isEmpty(name) && multisigPublicKey) {
          const signerMetadata = { key: decodeBase58(signerToAdd), name }
          await multisigService.updateSignerMetadata(
            multisigPublicKey,
            signerMetadata,
          )
        }
      }
    },
    [getValues, trigger],
  )

  return replaceMultisigOwner
}
