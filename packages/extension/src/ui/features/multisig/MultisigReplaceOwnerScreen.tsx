import { FC } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { routes, useRouteSignerToReplace } from "../../routes"
import { Account } from "../accounts/Account"
import { useRouteAccount } from "../shield/useRouteAccount"
import { useMultisig } from "./multisig.state"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { multisigService } from "../../services/multisig"
import {
  FieldValuesReplaceOwnerForm,
  useReplaceOwnerForm,
} from "./hooks/useReplaceOwnerForm"
import { ReplaceOwnerForm } from "./ReplaceOwnerForm"
import { Button, Divider, Flex } from "@chakra-ui/react"
import { H4, P3, P4 } from "@argent/ui"

export const MultisigReplaceOwnerScreen: FC = () => {
  const account = useRouteAccount()
  const signerToReplace = useRouteSignerToReplace()

  return (
    <MultisigSettingsWrapper>
      {account && signerToReplace && (
        <MultisigReplaceOwnerAccountWrapper
          account={account}
          signerToReplace={signerToReplace}
        />
      )}
    </MultisigSettingsWrapper>
  )
}

const MultisigReplaceOwnerAccountWrapper = ({
  account,
  signerToReplace,
}: {
  account: Account
  signerToReplace: string
}) => {
  const multisig = useMultisig(account)
  const methods = useReplaceOwnerForm()

  return (
    <FormProvider {...methods}>
      {multisig && (
        <MultisigReplace account={account} signerToRemove={signerToReplace} />
      )}
    </FormProvider>
  )
}

const MultisigReplace = ({
  account,
  signerToRemove,
}: {
  account: Account
  signerToRemove: string
}) => {
  const { trigger, getValues } = useFormContext<FieldValuesReplaceOwnerForm>()

  const navigate = useNavigate()

  const handleSubmit = async () => {
    const isValid = await trigger()
    if (isValid && signerToRemove && account?.address) {
      await multisigService.replaceOwner({
        signerToRemove,
        signerToAdd: getValues("signerKey"),
        address: account.address,
      })
      navigate(routes.accountActivity())
    }
  }

  return (
    <Flex
      m={4}
      justifyContent="space-between"
      flexDirection="column"
      height="full"
    >
      <Flex flexDirection="column" gap="1">
        <H4>Replace owner</H4>
        <P3 color="neutrals.100" pb={4}>
          Set a new owner for this multisig
        </P3>
        <P4 color="primary.400" mt="2" fontWeight="bold">
          For security reasons each owner should have their own Argent X wallet.
          Never add 2 signer pubkeys from the same Argent X wallet.
        </P4>
        <Divider my={4} color="neutrals.800" mt="4" />

        <ReplaceOwnerForm signerToRemove={signerToRemove} />
      </Flex>
      <Button colorScheme="primary" onClick={handleSubmit}>
        Replace owner
      </Button>
    </Flex>
  )
}
