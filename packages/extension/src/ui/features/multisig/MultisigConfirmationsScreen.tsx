import { H1, H4, P3 } from "@argent/ui"
import { Box, Button, Center, Flex } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC } from "react"
import { FormProvider, useFormContext } from "react-hook-form"

import {
  addMultisigOwners,
  updateMultisigThreshold,
} from "../../../shared/multisig/multisig.service"
import { Account } from "../accounts/Account"
import { useRouteAccount } from "../shield/useRouteAccount"
import { FieldValuesCreateMultisigForm } from "./hooks/useCreateMultisigForm"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import {
  FieldValuesThresholdForm,
  useUpdateThresholdForm,
} from "./hooks/useUpdateThreshold"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { SetConfirmationsInput } from "./SetConfirmationsInput"

export const MultisigConfirmationsScreen: FC = () => {
  const account = useRouteAccount()
  return (
    <MultisigSettingsWrapper>
      {account && <MultisigConfirmationsWithFormProvider account={account} />}
    </MultisigSettingsWrapper>
  )
}

const MultisigConfirmationsWithFormProvider = ({
  account,
}: {
  account: Account
}) => {
  const { multisig } = useMultisigInfo(account)

  const methods = useUpdateThresholdForm(multisig?.threshold)
  return (
    <FormProvider {...methods}>
      <MultisigConfirmationsWithoutOwners account={account} />
    </FormProvider>
  )
}
export const MultisigConfirmationsWithOwners = ({
  account,
}: {
  account: Account
}) => {
  const { multisig } = useMultisigInfo(account)
  const {
    trigger,
    formState: { errors },
    getValues,
  } = useFormContext<FieldValuesCreateMultisigForm>()

  const handleNextClick = () => {
    trigger()
    if (isEmpty(errors)) {
      addMultisigOwners({
        address: account.address,
        newThreshold: getValues("confirmations"),
        signersToAdd: getValues("signerKeys").map((signer) => signer.key),
        currentThreshold: multisig?.threshold,
      })
    }
  }
  const totalSigners = multisig?.signers
    ? multisig.signers.length + getValues("signerKeys").length
    : getValues("signerKeys").length

  return (
    <BaseMultisigConfirmations
      account={account}
      handleNextClick={handleNextClick}
      totalSigners={totalSigners}
    />
  )
}

export const MultisigConfirmationsWithoutOwners = ({
  account,
}: {
  account: Account
}) => {
  const { multisig } = useMultisigInfo(account)

  const {
    trigger,
    formState: { errors },
    getValues,
  } = useFormContext<FieldValuesThresholdForm>()

  const handleNextClick = () => {
    trigger()
    const newThreshold = getValues("confirmations")
    if (!Object.keys(errors).length && newThreshold !== multisig?.threshold) {
      updateMultisigThreshold({
        address: account.address,
        newThreshold: getValues("confirmations"),
      })
    }
  }

  return (
    <BaseMultisigConfirmations
      account={account}
      handleNextClick={handleNextClick}
      totalSigners={multisig?.signers.length}
      buttonTitle="Update confirmations"
    />
  )
}

export const BaseMultisigConfirmations = ({
  account,
  handleNextClick,
  totalSigners,
  buttonTitle = "Next",
}: {
  account: Account
  handleNextClick: () => void
  totalSigners?: number
  buttonTitle?: string
}) => {
  const { multisig } = useMultisigInfo(account)
  return (
    <Flex
      m={4}
      justifyContent="space-between"
      flexDirection="column"
      height="full"
    >
      <>
        <H4>Set confirmations</H4>
        <P3 color="neutrals.100" pb={4}>
          How many owners must confirm each transaction before it&apos;s sent?
        </P3>
      </>
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
        <Flex
          height="full"
          justifyContent="space-between"
          flexDirection="column"
        >
          <SetConfirmationsInput
            existingThreshold={multisig?.threshold}
            totalSigners={totalSigners}
          />
          <Button colorScheme="primary" onClick={handleNextClick}>
            {buttonTitle}
          </Button>
        </Flex>
      )}
    </Flex>
  )
}
