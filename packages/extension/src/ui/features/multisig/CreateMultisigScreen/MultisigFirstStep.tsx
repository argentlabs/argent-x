import { P2 } from "@argent/x-ui"
import { Box, Divider, Input, Spinner } from "@chakra-ui/react"
import { useFormContext } from "react-hook-form"

import { AddOwnersForm } from "../AddOwnerForm"
import type { FieldValuesCreateMultisigForm } from "../hooks/useCreateMultisigForm"
import { ScreenLayout } from "./ScreenLayout"
import { ActionButton } from "../../../components/FullScreenPage"

interface MultisigFirstStepProps {
  index: number
  goNext: () => void
  creatorSignerKey: string | undefined
  totalSteps?: number
  filledIndicator?: boolean
}

export const MultisigFirstStep = ({
  index,
  goNext,
  creatorSignerKey,
  totalSteps,
  filledIndicator = false,
}: MultisigFirstStepProps) => {
  const { register, trigger } = useFormContext<FieldValuesCreateMultisigForm>()
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
      length={totalSteps}
      filledIndicator={filledIndicator}
    >
      <P2 color="primary.400">
        For security reasons each owner should have their own Argent X wallet.
        Never add 2 signer pubkeys from the same Argent X wallet.
      </P2>
      <Divider color="neutrals.700" my="4" />
      <Box my="2" width="100%">
        <P2 mb="3">Owner 1 (Me)</P2>
        <Box position="relative">
          <Input
            placeholder={
              creatorSignerKey || "Assigning Ledger signer pubkey..."
            }
            {...register(`signerKeys.-1.key` as const, {
              required: true,
              value: creatorSignerKey,
            })}
            disabled={true}
            value={creatorSignerKey}
            position="relative"
            _placeholder={{ opacity: 1 }}
            _disabled={{ bg: "surface-elevated", opacity: 1 }}
            color="neutrals.300"
            fontSize="16px"
            fontWeight="600"
            lineHeight="20px"
            border="none"
            _hover={{ border: "none" }}
          />
          {!creatorSignerKey && (
            <Spinner position="absolute" top="5" right="5" size="sm" />
          )}
        </Box>
      </Box>
      <AddOwnersForm nextOwnerIndex={2} />
      <ActionButton onClick={() => void handleNavigationToConfirmationScreen()}>
        Next
      </ActionButton>
    </ScreenLayout>
  )
}
