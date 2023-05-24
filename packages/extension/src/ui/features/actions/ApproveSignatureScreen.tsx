import { H3, P3, P4, PreBoxJsonStringify } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"
import { typedData } from "starknet"

import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "./transaction/ApproveTransactionScreen/ConfirmScreen"

interface ApproveSignatureScreenProps extends ConfirmScreenProps {
  dataToSign: typedData.TypedData
}

export const ApproveSignatureScreen: FC<ApproveSignatureScreenProps> = ({
  dataToSign,
  ...rest
}) => {
  return (
    <ConfirmScreen confirmButtonText="Sign" {...rest}>
      <Flex flexDirection={"column"} flex={1} gap={4}>
        <H3>Sign message</H3>
        <P3>A dapp wants you to sign this message:</P3>
        <PreBoxJsonStringify json={dataToSign} />
      </Flex>
    </ConfirmScreen>
  )
}
