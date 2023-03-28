import { H4, P3 } from "@argent/ui"
import { Box, Button, Divider, Flex } from "@chakra-ui/react"
import { FC, useState } from "react"
import { FormProvider, useFormContext } from "react-hook-form"

import { Account } from "../accounts/Account"
import { useEncodedPublicKeys, useSignerKey } from "../accounts/usePublicKey"
import { useRouteAccount } from "../shield/useRouteAccount"
import { AddOwnersForm } from "./AddOwnerForm"
import {
  FieldValuesCreateMultisigForm,
  useCreateMultisigForm,
} from "./hooks/useCreateMultisigForm"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import { MultisigConfirmationsWithOwners } from "./MultisigConfirmationsScreen"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"

export const MultisigAddOwnersScreen: FC = () => {
  const account = useRouteAccount()
  const signerKey = useSignerKey()
  const methods = useCreateMultisigForm(signerKey)
  const [step, setStep] = useState(0)
  const [goBack, setGoBack] = useState<undefined | (() => void)>(undefined)
  const goNext = () => {
    setGoBack(() => () => setStep((step) => step - 1))
    setStep((step) => step + 1)
  }

  return (
    <MultisigSettingsWrapper goBack={goBack}>
      <FormProvider {...methods}>
        {account && (
          <>
            {step === 0 && (
              <MultisigAddOwners account={account} goNext={goNext} />
            )}
            {step === 1 && (
              <MultisigConfirmationsWithOwners account={account} />
            )}
          </>
        )}
      </FormProvider>
    </MultisigSettingsWrapper>
  )
}

const MultisigAddOwners = ({
  account,
  goNext,
}: {
  account: Account
  goNext: () => void
}) => {
  const { multisig } = useMultisigInfo(account)
  const { trigger } = useFormContext<FieldValuesCreateMultisigForm>()

  const signerKeys = useEncodedPublicKeys(multisig?.signers ?? [])
  const handleNavigationToConfirmationScreen = async () => {
    const isValid = await trigger("signerKeys")
    if (isValid) {
      goNext()
    }
  }
  return (
    <Box m={4} height="100%">
      <Flex flexDirection="column" height="100%" justifyContent="space-between">
        <Box>
          <H4>Add owners</H4>
          <P3 color="neutrals.300">
            Ask your co-owners to go to “Join existing multisig” in Argent X and
            send you their signer key
          </P3>
          <P3 color="primary.400">A signer key is NOT an account address</P3>
          <Divider my={4} color="neutrals.800" />
          <AddOwnersForm nextOwnerIndex={signerKeys.length + 1} />
        </Box>
        <Button
          colorScheme="primary"
          onClick={handleNavigationToConfirmationScreen}
        >
          Next
        </Button>
      </Flex>
    </Box>
  )
}
