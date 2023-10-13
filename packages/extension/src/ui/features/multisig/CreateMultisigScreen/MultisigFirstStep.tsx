import { P3 } from "@argent/ui"
import { Box, Button, Divider, Input } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

import { useNextSignerKey } from "../../accounts/usePublicKey"
import { AddOwnersForm } from "../AddOwnerForm"
import { FieldValuesCreateMultisigForm } from "../hooks/useCreateMultisigForm"
import { ScreenLayout } from "./ScreenLayout"

export const MultisigFirstStep = ({
  index,
  goNext,
  networkId,
}: {
  networkId: string
  index: number
  goNext: () => void
}) => {
  const { register, trigger } = useFormContext<FieldValuesCreateMultisigForm>()
  const creatorSignerKey = useNextSignerKey(networkId)
  const handleNavigationToConfirmationScreen = async () => {
    const isValid = await trigger("signerKeys")
    if (isValid) {
      goNext()
    }
  }

  return (
    <ScreenLayout
      subtitle="Ask your co-owners to go to “Join existing multisig” in Argent X and send you their signer pubkey"
      currentIndex={index}
      title="Add owners"
    >
      <P3 color="primary.400">
        For security reasons each owner should have their own Argent X wallet.
        Never add 2 signer pubkeys from the same Argent X wallet.
      </P3>
      <Divider color="neutrals.700" my="4" />
      <Box my="2" width="100%">
        <P3 mb="1">Owner 1 (Me)</P3>
        <Input
          placeholder={creatorSignerKey}
          {...register(`signerKeys.-1.key` as const, {
            required: true,
            value: creatorSignerKey,
          })}
          disabled={true}
          value={creatorSignerKey}
        />
      </Box>
      <AddOwnersForm nextOwnerIndex={2} />
      <Button
        colorScheme="primary"
        onClick={handleNavigationToConfirmationScreen}
      >
        Next
      </Button>
    </ScreenLayout>
  )
}
