import React, { FC } from "react"

import { ConfirmScreen } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { Circle, Flex } from "@chakra-ui/react"
import { H5, P4, iconsDeprecated } from "@argent/x-ui"
import { WalletAccount } from "../../../shared/wallet.model"

const { AlertFillIcon, SignIcon } = iconsDeprecated

interface SignatureRequestRejectedScreenProps {
  selectedAccount?: WalletAccount
  onReject: () => void
  error: string
}

export const SignatureRequestRejectedScreen: FC<
  SignatureRequestRejectedScreenProps
> = ({ selectedAccount, onReject, error }) => {
  return (
    <ConfirmScreen
      selectedAccount={selectedAccount}
      onReject={onReject}
      showConfirmButton={false}
    >
      <>
        <Flex
          flexDirection="column"
          flex={1}
          gap={3}
          alignItems="center"
          justifyContent="center"
          mb={6}
        >
          <Circle size={14} bg="neutrals.600">
            <SignIcon width={6} height={6} />
          </Circle>
          <Flex
            gap={1}
            flexDirection="column"
            flex={1}
            alignItems="center"
            justifyContent="center"
          >
            <H5>Signature request</H5>
            <P4 color="neutrals.300">A dapp is requesting to sign a message</P4>
          </Flex>
        </Flex>
        <Flex
          p={3}
          backgroundColor="surface-danger-default"
          borderRadius={12}
          gap={2}
        >
          <AlertFillIcon width={5} height={5} color="text-danger" />
          <P4 fontWeight="bold" color="text-danger">
            {error}
          </P4>
        </Flex>
      </>
    </ConfirmScreen>
  )
}
