import { H5, P3 } from "@argent/ui"
import { Center, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { formatFullAddress } from "../../services/addresses"
import { ConfirmScreen } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { HideOrDeleteAccountConfirmScreenContainerProps } from "./HideOrDeleteAccountConfirmScreenContainer"

interface HideOrDeleteAccountConfirmScreenProps
  extends HideOrDeleteAccountConfirmScreenContainerProps {
  accountName: string
  accountAddress: string
  onSubmit: () => void
  onReject: () => void
}

export const HideOrDeleteAccountConfirmScreen: FC<
  HideOrDeleteAccountConfirmScreenProps
> = ({ mode, accountName, accountAddress, onSubmit, onReject }) => {
  return (
    <ConfirmScreen
      confirmButtonText={mode === "hide" ? "Hide" : "Delete"}
      rejectButtonText="Cancel"
      onSubmit={onSubmit}
      onReject={onReject}
      destructive={mode === "delete"}
    >
      <VStack spacing={8} align={"start"}>
        <P3>
          {mode === "hide"
            ? "You are about to hide the following account:"
            : "You are about to delete the following account:"}
        </P3>
        <Center
          rounded={"lg"}
          bg={"neutrals.600"}
          py={4}
          px={8}
          flexDirection={"column"}
          textAlign={"center"}
          gap={4}
        >
          <H5>{accountName}</H5>
          <P3>{formatFullAddress(accountAddress)}</P3>
        </Center>
        <P3>
          {mode === "hide"
            ? "You will be able to unhide the account from the account list screen."
            : "You will not be able to recover this account in the future."}
        </P3>
      </VStack>
    </ConfirmScreen>
  )
}
