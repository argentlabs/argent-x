import { FieldError } from "@argent/x-ui"
import { Box } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

import { isEmptyValue } from "../../../../shared/utils/object"
import { useAction } from "../../../hooks/useAction"
import { useDecodedSignerKey } from "../../accounts/usePublicKey"
import type { FieldValuesCreateMultisigForm } from "../hooks/useCreateMultisigForm"
import { SetConfirmationsInput } from "../SetConfirmationsInput"
import { ScreenLayout } from "./ScreenLayout"
import { getErrorData } from "../../../../shared/errors/errorData"
import { clientAccountService } from "../../../services/account"
import { multisigService } from "../../../services/multisig"
import { decodeBase58 } from "@argent/x-shared"
import type { SignerMetadata } from "../../../../shared/multisig/types"
import { isEmpty } from "lodash-es"
import type { SignerType } from "../../../../shared/wallet.model"
import { useState } from "react"
import { ActionButton } from "../../../components/FullScreenPage"

type MultisigSecondStepProps = {
  index: number
  goBack: () => void
  goNext: () => void
  networkId: string
  creator: {
    pubKey: string | undefined
    derivationPath: string | undefined
    index: number | undefined
  }
  creatorType: SignerType
  totalSteps?: number
  filledIndicator?: boolean
}

export const MultisigSecondStep = ({
  index,
  goBack,
  goNext,
  networkId,
  creator,
  creatorType,
  totalSteps,
  filledIndicator,
}: MultisigSecondStepProps) => {
  const creatorPubKey = useDecodedSignerKey(creator.pubKey)
  const [loading, setLoading] = useState(false)
  const { action: createAccount, error } = useAction(
    clientAccountService.create.bind(clientAccountService),
  )

  const {
    formState: { errors },
    getValues,
    trigger,
  } = useFormContext<FieldValuesCreateMultisigForm>()

  const handleCreateMultisig = async () => {
    try {
      setLoading(true)
      await trigger()
      if (isEmptyValue(errors) && creatorPubKey && creator.pubKey) {
        const signerKeys = getValues("signerKeys")
        const signers = [creator.pubKey].concat(signerKeys.map((i) => i.key))

        const threshold = getValues("confirmations")

        const result = await createAccount("multisig", creatorType, networkId, {
          creator: creatorPubKey,
          index: creator.index,
          derivationPath: creator.derivationPath,
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenLayout
      subtitle="How many owners must confirm each transaction before it’s sent?"
      currentIndex={index}
      title="Set confirmations"
      goBack={goBack}
      back={true}
      length={totalSteps}
      filledIndicator={filledIndicator}
    >
      <SetConfirmationsInput
        totalSigners={getValues("signerKeys").length + 1}
        existingThreshold={getValues("confirmations") ?? 1}
      />
      <ActionButton
        onClick={() => void handleCreateMultisig()}
        mt="3"
        isLoading={loading}
      >
        Create multisig
      </ActionButton>
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
