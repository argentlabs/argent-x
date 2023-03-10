import { H4, P3 } from "@argent/ui"
import { Box, Button, Divider, Flex } from "@chakra-ui/react"
import { FC, useState } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useParams } from "react-router-dom"

import { Account } from "../accounts/Account"
import { useAccount } from "../accounts/accounts.state"
import { useEncodedPublicKeys } from "../accounts/usePublicKey"
import { useCurrentNetwork } from "../networks/useNetworks"
import { AddOwnersForm } from "./AddOwnerForm"
import {
  FieldValues,
  useCreateMultisigForm,
} from "./hooks/useCreateMultisigForm"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import { MultisigConfirmations } from "./MultisigConfirmationsScreen"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"

export const MultisigAddOwnersScreen: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const account = useAccount({
    address: accountAddress,
    networkId: currentNetwork.id,
  })
  const methods = useCreateMultisigForm()
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
            {step === 1 && <MultisigConfirmations account={account} />}
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
  const { trigger } = useFormContext<FieldValues>()

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
