import { H2, P2, PreBoxJsonStringify } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { FC, ReactNode } from "react"
import type { TypedData } from "@starknet-io/types-js"

import type { ConfirmScreenProps } from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { ConfirmScreen } from "./transaction/ApproveTransactionScreen/ConfirmScreen"

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
        <H2>Sign message</H2>
        <P2>A dapp wants you to sign this message:</P2>
        <PreBoxJsonStringify json={dataToSign} />
      </Flex>
    </ConfirmScreen>
  )
}
