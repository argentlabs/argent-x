import { H3, P3, PreBoxJsonStringify } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC, ReactNode } from "react"
import { TypedData } from "@starknet-io/types-js"

import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "./transaction/ApproveTransactionScreen/ConfirmScreen"

interface ApproveSignatureScreenProps extends ConfirmScreenProps {
  dataToSign: TypedData
  actionIsApproving?: boolean
  footer?: ReactNode
}

export const ApproveSignatureScreen: FC<ApproveSignatureScreenProps> = ({
  dataToSign,
  actionIsApproving,
  ...rest
}) => {
  return (
    <ConfirmScreen
      confirmButtonText="Sign"
      confirmButtonLoadingText="Sign"
      confirmButtonDisabled={actionIsApproving}
      confirmButtonIsLoading={actionIsApproving}
      {...rest}
    >
      <Flex flexDirection={"column"} flex={1} gap={4}>
        <H3>Sign message</H3>
        <P3>A dapp wants you to sign this message:</P3>
        <PreBoxJsonStringify json={dataToSign} />
      </Flex>
    </ConfirmScreen>
  )
}
