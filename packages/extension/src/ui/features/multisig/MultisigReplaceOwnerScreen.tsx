import type { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { H3, P2, P3 } from "@argent/x-ui"
import { Button, Divider, Flex } from "@chakra-ui/react"
import { useRouteSignerToReplace } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { ReplaceOwnerForm } from "./ReplaceOwnerForm"
import { useReplaceOwnerForm } from "./hooks/useReplaceOwnerForm"
import { multisigView } from "./multisig.state"
import { useView } from "../../views/implementation/react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useReplaceMultisigOwner } from "./hooks/useReplaceMultisigOwner"

export const MultisigReplaceOwnerScreen: FC = () => {
  const account = useRouteWalletAccount()
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
  account: WalletAccount
  signerToReplace: string
}) => {
  const multisig = useView(multisigView(account))
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
  account: WalletAccount
  multisigPublicKey?: string
  signerToRemove: string
}) => {
  const replaceMultisigOwner = useReplaceMultisigOwner()

  const navigate = useNavigate()

  const handleSubmit = async () => {
    await replaceMultisigOwner(signerToRemove, account, multisigPublicKey)
    navigate(routes.accountActivity())
  }

  return (
    <Flex
      m={4}
      justifyContent="space-between"
      flexDirection="column"
      height="full"
    >
      <Flex flexDirection="column" gap="1">
        <H3>Replace owner</H3>
        <P2 color="neutrals.100" pb={4}>
          Set a new owner for this multisig
        </P2>
        <P3 color="primary.400" mt="2" fontWeight="bold">
          For security reasons each owner should have their own Argent X wallet.
          Never add 2 signer pubkeys from the same Argent X wallet.
        </P3>
        <Divider my={4} color="neutrals.800" mt="4" />

        <ReplaceOwnerForm signerToRemove={signerToRemove} />
      </Flex>
      <Button colorScheme="primary" onClick={() => void handleSubmit()}>
        Replace owner
      </Button>
    </Flex>
  )
}
