import { H2, PreBox } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC } from "react"

import type { ConfirmScreenProps } from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { ConfirmScreen } from "./transaction/ApproveTransactionScreen/ConfirmScreen"

interface ErrorScreenProps extends ConfirmScreenProps {
  message: string
}

export const ErrorScreen: FC<ErrorScreenProps> = ({ message, ...rest }) => {
  return (
    <ConfirmScreen confirmButtonText="Back" singleButton {...rest}>
      <Flex flexDirection={"column"} flex={1} gap={4}>
        <H2>Something went wrong</H2>
        <PreBox>{message}</PreBox>
      </Flex>
    </ConfirmScreen>
  )
}
