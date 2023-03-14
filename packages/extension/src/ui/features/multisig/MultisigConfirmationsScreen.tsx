import { H1, H4, P3 } from "@argent/ui"
import { Box, Button, Center } from "@chakra-ui/react"
import { BigNumber, utils } from "ethers"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useParams } from "react-router-dom"
import { stark } from "starknet"

import { executeTransaction } from "../../services/backgroundTransactions"
import { getUint256CalldataFromBN } from "../../services/transactions"
import { Account } from "../accounts/Account"
import { useAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { FieldValues } from "./hooks/useCreateMultisigForm"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import { MultisigSettingsWrapper } from "./MultisigSettingsWrapper"
import { SetConfirmationsInput } from "./SetConfirmationsInput"

export const MultisigConfirmationsScreen: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const account = useAccount({
    address: accountAddress,
    networkId: currentNetwork.id,
  })

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

  const getThresholdPayload = () => {
    const newThreshold = getValues("confirmations")
    if (newThreshold === multisig?.threshold) {
      return null
    }
    return {
      entrypoint: "changeThreshold",
      calldata: stark.compileCalldata({
        new_threshold: getUint256CalldataFromBN(BigNumber.from(newThreshold)),
      }),
      contractAddress: account.address,
    }
  }

  const getSignersPayload = () => {
    const newSigners = getValues("signerKeys")
    const new_threshold = getUint256CalldataFromBN(
      BigNumber.from(getValues("confirmations")),
    )
    const signers_to_add_len = getUint256CalldataFromBN(
      BigNumber.from(getValues("signerKeys").length),
    )
    console.log(newSigners.length)
    return {
      entrypoint: "addSigners",
      calldata: stark.compileCalldata({
        new_threshold,
        signers_to_add_len,
        // new_threshold: getUint256CalldataFromBN(
        //   BigNumber.from(getValues("confirmations")),
        // ),
        // signers_to_add_len: getUint256CalldataFromBN(
        //   BigNumber.from(newSigners.length),
        // ),
        signers_to_add: newSigners.map((signer) =>
          utils.hexlify(utils.base58.decode(signer.key)),
        ),
      }),
      contractAddress: account.address,
    }
  }

  const handleNextClick = () => {
    trigger()
    console.log(
      getUint256CalldataFromBN(BigNumber.from(getValues("signerKeys").length)),
      getUint256CalldataFromBN(BigNumber.from(getValues("confirmations"))),
    )
    if (!Object.keys(errors).length) {
      const thresholdPayload = getThresholdPayload()
      const signersPayload = getSignersPayload()
      const transactions = thresholdPayload
        ? [thresholdPayload, signersPayload]
        : signersPayload
      executeTransaction({ transactions })
    }
    // TODO: implement
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
