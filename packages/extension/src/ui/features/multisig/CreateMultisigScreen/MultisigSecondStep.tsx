import { FieldError } from "@argent/ui"
import { Box, Button } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

import { isEmptyValue } from "../../../../shared/utils/object"
import { useAppState } from "../../../app.state"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { useNextPublicKey, useNextSignerKey } from "../../accounts/usePublicKey"
import { useCreateMultisig } from "../hooks/useCreateMultisig"
import { FieldValues } from "../hooks/useCreateMultisigForm"
import { SetConfirmationsInput } from "../SetConfirmationsInput"
import { ScreenLayout } from "./ScreenLayout"

export const MultisigSecondStep = ({
  index,
  goBack,
  goNext,
}: {
  index: number
  goBack: () => void
  goNext: () => void
}) => {
  const { switcherNetworkId } = useAppState()
  const creatorPubKey = useNextPublicKey()
  const creatorSignerKey = useNextSignerKey()
  const { createMultisigAccount, isError } = useCreateMultisig()
  const {
    formState: { errors },
    getValues,
    trigger,
  } = useFormContext<FieldValues>()

  const selectedAccount = useSelectedAccount()

  const handleCreateMultisig = async () => {
    trigger()
    if (isEmptyValue(errors) && creatorSignerKey && selectedAccount) {
      const signers = [creatorSignerKey].concat(
        getValues("signerKeys").map((i) => i.key),
      )

      const threshold = getValues("confirmations")

      const result = await createMultisigAccount({
        creator: creatorPubKey,
        signers,
        threshold,
        networkId: switcherNetworkId,
      })
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
      <SetConfirmationsInput />
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
