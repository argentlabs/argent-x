import { FC } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { decodeBase58 } from "@argent/x-shared"
import { H4, P3, P4 } from "@argent/x-ui"
import { Button, Divider, Flex } from "@chakra-ui/react"
import { routes, useRouteSignerToReplace } from "../../routes"
import { multisigService } from "../../services/multisig"
import { Account } from "../accounts/Account"
import { useRouteAccount } from "../shield/useRouteAccount"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { ReplaceOwnerForm } from "./ReplaceOwnerForm"
import {
  FieldValuesReplaceOwnerForm,
  useReplaceOwnerForm,
} from "./hooks/useReplaceOwnerForm"
import { useMultisig } from "./multisig.state"
import { isEmpty } from "lodash-es"

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
        <MultisigReplace
          account={account}
          signerToRemove={signerToReplace}
          multisigPublicKey={multisig.publicKey}
        />
      )}
    </FormProvider>
  )
}

const MultisigReplace = ({
  account,
  multisigPublicKey,
  signerToRemove,
}: {
  account: Account
  multisigPublicKey?: string
  signerToRemove: string
}) => {
  const { trigger, getValues } = useFormContext<FieldValuesReplaceOwnerForm>()

  const navigate = useNavigate()

  const handleSubmit = async () => {
    const signerToAdd = getValues("signerKey")
    const isValid = await trigger()

    if (isValid && signerToRemove && account?.address) {
      await multisigService.replaceOwner({
        signerToRemove,
        signerToAdd,
        address: account.address,
      })

      const name = getValues("name")

      // need to do name && !isEmpty(name) because the compiler doesn't recognize isEmpty as a type guard
      if (name && !isEmpty(name) && multisigPublicKey) {
        const signerMetadata = { key: decodeBase58(signerToAdd), name }
        await multisigService.updateSignerMetadata(
          multisigPublicKey,
          signerMetadata,
        )
        await multisigService.removeSignerMetadata(
          multisigPublicKey,
          decodeBase58(signerToRemove),
        )
      }

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
      <Button colorScheme="primary" onClick={() => void handleSubmit()}>
        Replace owner
      </Button>
    </Flex>
  )
}
