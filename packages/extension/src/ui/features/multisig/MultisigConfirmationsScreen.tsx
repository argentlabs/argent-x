import { H1, H4, P3 } from "@argent/x-ui"
import { Box, Button, Center, Flex } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"
import { FieldValuesCreateMultisigForm } from "./hooks/useCreateMultisigForm"
import {
  FieldValuesThresholdForm,
  useUpdateThresholdForm,
} from "./hooks/useUpdateThreshold"
import { multisigView } from "./multisig.state"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { SetConfirmationsInput } from "./SetConfirmationsInput"
import { multisigService } from "../../services/multisig"
import { SignerMetadata } from "../../../shared/multisig/types"
import { decodeBase58 } from "@argent/x-shared"
import { useView } from "../../views/implementation/react"
import { WalletAccount } from "../../../shared/wallet.model"

export const MultisigConfirmationsScreen: FC = () => {
  const account = useRouteWalletAccount()
  return (
    <MultisigSettingsWrapper>
      {account && <MultisigConfirmationsWithFormProvider account={account} />}
    </MultisigSettingsWrapper>
  )
}

const MultisigConfirmationsWithFormProvider = ({
  account,
}: {
  account: WalletAccount
}) => {
  const multisig = useView(multisigView(account))

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
  account: WalletAccount
}) => {
  const multisig = useView(multisigView(account))
  const navigate = useNavigate()

  const {
    trigger,
    formState: { errors },
    getValues,
  } = useFormContext<FieldValuesCreateMultisigForm>()

  const handleNextClick = async () => {
    await trigger()
    if (isEmpty(errors)) {
      const signerKeys = getValues("signerKeys")

      await multisigService.addOwner({
        address: account.address,
        newThreshold: getValues("confirmations"),
        signersToAdd: signerKeys.map((signer) => signer.key),
        currentThreshold: multisig?.threshold,
      })
      if (!multisig?.creator) {
        return
      }
      const signersWithMetadata = signerKeys
        .filter((signer) => !isEmpty(signer.name))
        .map(
          (signer) =>
            ({
              key: decodeBase58(signer.key),
              name: signer.name,
            }) as SignerMetadata,
        )

      await multisigService.updateSignersMetadata(
        multisig?.publicKey,
        signersWithMetadata,
      )

      navigate(routes.accountActivity())
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
  account: WalletAccount
}) => {
  const multisig = useView(multisigView(account))
  const navigate = useNavigate()

  const {
    trigger,
    formState: { errors },
    getValues,
  } = useFormContext<FieldValuesThresholdForm>()

  const handleNextClick = async () => {
    await trigger()
    const newThreshold = getValues("confirmations")
    if (!Object.keys(errors).length && newThreshold !== multisig?.threshold) {
      await multisigService.updateThreshold({
        address: account.address,
        newThreshold: getValues("confirmations"),
      })

      navigate(routes.accountActivity())
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
  threshold,
  buttonTitle = "Next",
}: {
  account: WalletAccount
  handleNextClick: () => void | Promise<void>
  totalSigners?: number
  threshold?: number
  buttonTitle?: string
}) => {
  const multisig = useView(multisigView(account))

  return (
    <Flex
      m={4}
      justifyContent="space-between"
      flexDirection="column"
      height="full"
    >
      <Flex flexDirection="column" gap="1">
        <H4>Set confirmations</H4>
        <P3 color="neutrals.100" pb={4}>
          How many owners must confirm each transaction before it&apos;s sent?
        </P3>
      </Flex>
      {account.needsDeploy ? (
        <Box height="full">
          <Box
            borderRadius="lg"
            backgroundColor="neutrals.800"
            p={3}
            my={4}
            boxShadow="menu"
          >
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
            existingThreshold={threshold || multisig?.threshold}
            totalSigners={totalSigners}
          />
          <Button
            data-testid="update-confirmations"
            colorScheme="primary"
            onClick={() => void handleNextClick()}
          >
            {buttonTitle}
          </Button>
        </Flex>
      )}
    </Flex>
  )
}
