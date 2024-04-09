import { FieldError } from "@argent/x-ui"
import { Box, Button } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

import { isEmptyValue } from "../../../../shared/utils/object"
import { useAction } from "../../../hooks/useAction"
import { useNextPublicKey, useNextSignerKey } from "../../accounts/usePublicKey"
import { FieldValuesCreateMultisigForm } from "../hooks/useCreateMultisigForm"
import { SetConfirmationsInput } from "../SetConfirmationsInput"
import { ScreenLayout } from "./ScreenLayout"
import { getErrorData } from "../../../../shared/errors/errorData"
import { clientAccountService } from "../../../services/account"
import { multisigService } from "../../../services/multisig"
import { decodeBase58 } from "@argent/x-shared"
import { SignerMetadata } from "../../../../shared/multisig/types"
import { isEmpty } from "lodash-es"

export const MultisigSecondStep = ({
  index,
  goBack,
  goNext,
  networkId,
}: {
  networkId: string
  index: number
  goBack: () => void
  goNext: () => void
}) => {
  const creatorPubKey = useNextPublicKey(networkId)
  const creatorSignerKey = useNextSignerKey(networkId)
  const { action: createAccount, error } = useAction(
    clientAccountService.create.bind(clientAccountService),
  )

  const {
    formState: { errors },
    getValues,
    trigger,
  } = useFormContext<FieldValuesCreateMultisigForm>()

  const handleCreateMultisig = async () => {
    await trigger()
    if (isEmptyValue(errors) && creatorPubKey && creatorSignerKey) {
      const signerKeys = getValues("signerKeys")
      const signers = [creatorSignerKey].concat(signerKeys.map((i) => i.key))

      const threshold = getValues("confirmations")

      const result = await createAccount("multisig", networkId, {
        creator: creatorPubKey,
        signers,
        threshold,
        publicKey: creatorPubKey,
        updatedAt: Date.now(),
      })

      const signersWithMetadata = signerKeys
        .filter((signer) => !isEmpty(signer.name))
        .map(
          (signer) =>
            ({
              key: decodeBase58(signer.key),
              name: signer.name,
            }) as SignerMetadata,
        )

      await multisigService.updateSignersMetadata(
        creatorPubKey,
        signersWithMetadata,
      )

      if (result) {
        goNext()
      }
    }
  }

  return (
    <ScreenLayout
      subtitle="How many owners must confirm each transaction before it’s sent?"
      currentIndex={index}
      title="Set confirmations"
      goBack={goBack}
      back={true}
    >
      <SetConfirmationsInput
        totalSigners={getValues("signerKeys").length + 1}
        existingThreshold={getValues("confirmations") ?? 1}
      />
      <Button colorScheme="primary" onClick={handleCreateMultisig} mt="3">
        Create multisig
      </Button>
      {error && (
        <Box mt="2">
          <FieldError>
            Something went wrong creating the multisig.{" "}
            {getErrorData(error)?.message}
          </FieldError>
        </Box>
      )}
    </ScreenLayout>
  )
}
