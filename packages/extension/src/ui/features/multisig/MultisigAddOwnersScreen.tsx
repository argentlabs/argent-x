import { H4, P3 } from "@argent/x-ui"
import { Box, Button, Divider, Flex } from "@chakra-ui/react"
import { FC, useState } from "react"
import { FormProvider, useFormContext } from "react-hook-form"

import { useEncodedPublicKeys, useSignerKey } from "../accounts/usePublicKey"
import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"
import { AddOwnersForm } from "./AddOwnerForm"
import {
  FieldValuesCreateMultisigForm,
  useCreateMultisigForm,
} from "./hooks/useCreateMultisigForm"
import { multisigView } from "./multisig.state"
import { MultisigConfirmationsWithOwners } from "./MultisigConfirmationsScreen"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { useNavigate } from "react-router-dom"
import { useView } from "../../views/implementation/react"
import { WalletAccount } from "../../../shared/wallet.model"

export const MultisigAddOwnersScreen: FC = () => {
  const account = useRouteWalletAccount()
  const signerKey = useSignerKey(account)
  const methods = useCreateMultisigForm(signerKey)
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [goBack, setGoBack] = useState<undefined | (() => void)>(undefined)
  const goNext = () => {
    setGoBack(() => () => {
      setStep((step) => {
        if (step === 0) {
          navigate(-1)
        }
        return step - 1
      })
    })
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
  account: WalletAccount
  goNext: () => void
}) => {
  const multisig = useView(multisigView(account))
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
        <Flex flexDirection="column" gap="1">
          <H4>Add owners</H4>
          <P3 color="neutrals.300">
            Ask your co-owners to go to “Join existing multisig” in Argent X and
            send you their signer pubkey
          </P3>
          <P3 color="primary.400" mt="3">
            For security reasons each owner should have their own Argent X
            wallet. Never add 2 signer pubkeys from the same Argent X wallet.
          </P3>
          <Divider my={4} color="neutrals.800" mt="4" />
          <AddOwnersForm
            nextOwnerIndex={signerKeys.length + 1}
            isNewMultisig={false}
          />
        </Flex>
        <Button
          colorScheme="primary"
          onClick={() => void handleNavigationToConfirmationScreen()}
        >
          Next
        </Button>
      </Flex>
    </Box>
  )
}
