import { H3, PreBox } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "./transaction/ApproveTransactionScreen/ConfirmScreen"

interface ErrorScreenProps extends ConfirmScreenProps {
  message: string
}

export const ErrorScreen: FC<ErrorScreenProps> = ({ message, ...rest }) => {
  return (
    <ConfirmScreen confirmButtonText="Back" singleButton {...rest}>
      <Flex flexDirection={"column"} flex={1} gap={4}>
        <H3>Something went wrong</H3>
        <PreBox>{message}</PreBox>
      </Flex>
    </ConfirmScreen>
  )
}
