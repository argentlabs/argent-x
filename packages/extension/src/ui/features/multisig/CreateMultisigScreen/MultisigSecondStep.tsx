import { FieldError } from "@argent/ui"
import { Box, Button } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

import { accountService } from "../../../../shared/account/service"
import { isEmptyValue } from "../../../../shared/utils/object"
import { useAction } from "../../../hooks/useAction"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { useNextPublicKey, useNextSignerKey } from "../../accounts/usePublicKey"
import { FieldValuesCreateMultisigForm } from "../hooks/useCreateMultisigForm"
import { SetConfirmationsInput } from "../SetConfirmationsInput"
import { ScreenLayout } from "./ScreenLayout"

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
  const { action: createAccount, error: isError } = useAction(
    accountService.create,
  )
  const {
    formState: { errors },
    getValues,
    trigger,
  } = useFormContext<FieldValuesCreateMultisigForm>()

  const selectedAccount = useSelectedAccount()

  const handleCreateMultisig = async () => {
    await trigger()
    if (
      isEmptyValue(errors) &&
      creatorPubKey &&
      creatorSignerKey &&
      selectedAccount
    ) {
      const signers = [creatorSignerKey].concat(
        getValues("signerKeys").map((i) => i.key),
      )

      const threshold = getValues("confirmations")

      const result = await createAccount(
        "multisig",
        selectedAccount.networkId,
        {
          creator: creatorPubKey,
          signers,
          threshold,
          publicKey: creatorPubKey,
        },
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
      {isError && (
        <Box mt="2">
          <FieldError>Something went wrong creating the multisig</FieldError>
        </Box>
      )}
    </ScreenLayout>
  )
}
