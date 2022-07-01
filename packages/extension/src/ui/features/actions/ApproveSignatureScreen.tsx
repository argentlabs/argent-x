import { FC } from "react"
import type { typedData } from "starknet"
import styled from "styled-components"

import { P } from "../../components/Typography"
import { usePageTracking } from "../../services/analytics"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"

interface ApproveSignatureScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  dataToSign: typedData.TypedData
  onSubmit: (data: typedData.TypedData) => void
}

export const Pre = styled.pre`
  margin-top: 24px;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  max-width: calc(100vw - 64px);
  overflow: auto;
`

export const ApproveSignatureScreen: FC<ApproveSignatureScreenProps> = ({
  dataToSign,
  onSubmit,
  ...props
}) => {
  usePageTracking("signMessage")
  return (
    <ConfirmScreen
      title="Sign message"
      confirmButtonText="Sign"
      onSubmit={() => {
        onSubmit(dataToSign)
      }}
      {...props}
    >
      <P>A dapp wants you to sign this message:</P>
      <Pre>{JSON.stringify(dataToSign, null, 2)}</Pre>
    </ConfirmScreen>
  )
}
