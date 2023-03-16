import { H1, H4, P3 } from "@argent/ui"
import { Box, Button, Center } from "@chakra-ui/react"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { addMultisigOwners } from "../../../shared/multisig/multisig.service"
import { Account } from "../accounts/Account"
import { useRouteAccount } from "../shield/useRouteAccount"
import { FieldValues } from "./hooks/useCreateMultisigForm"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { SetConfirmationsInput } from "./SetConfirmationsInput"

export const MultisigConfirmationsScreen: FC = () => {
  const account = useRouteAccount()
  return (
    <MultisigSettingsWrapper>
      {account && <MultisigConfirmations account={account} />}
    </MultisigSettingsWrapper>
  )
}

export const MultisigConfirmations = ({ account }: { account: Account }) => {
  const { multisig } = useMultisigInfo(account)
  const {
    trigger,
    formState: { errors },
    getValues,
  } = useFormContext<FieldValues>()

  const handleNextClick = () => {
    trigger()
    if (!Object.keys(errors).length) {
      addMultisigOwners({
        address: account.address,
        newThreshold: getValues("confirmations"),
        signersToAdd: getValues("signerKeys").map((signer) => signer.key),
        currentThreshold: multisig?.threshold,
      })
    }
  }
  account.needsDeploy = false
  return (
    <Box m={4}>
      <H4>Set confirmations</H4>
      <P3 color="neutrals.100" pb={4}>
        How many owners must confirm each transaction before it&apos;s sent?
      </P3>
      {account.needsDeploy ? (
        <Box>
          <Box borderRadius="lg" backgroundColor="neutrals.800" p={4} my={4}>
            <Center>
              <H1>{multisig?.threshold}</H1>
            </Center>
          </Box>
          <Center>
            <P3 color="neutrals.100">
              out of {multisig?.signers.length} owners
            </P3>
          </Center>
        </Box>
      ) : (
        <>
          <SetConfirmationsInput
            existingThreshold={multisig?.threshold}
            existingSigners={multisig?.signers.length}
          />
          <Button colorScheme="primary" onClick={handleNextClick}>
            Next
          </Button>
        </>
      )}
    </Box>
  )
}
