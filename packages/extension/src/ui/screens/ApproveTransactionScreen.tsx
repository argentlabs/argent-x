import { FC } from "react"
import type { InvokeFunctionTransaction } from "starknet"
import styled from "styled-components"

import { P } from "../components/Typography"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"

interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  transaction: InvokeFunctionTransaction
  onSubmit: (transaction: InvokeFunctionTransaction) => void
}

const Pre = styled.pre`
  margin-top: 24px;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  max-width: calc(100vw - 64px);
  overflow: auto;
`

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transaction,
  onSubmit,
  ...props
}) => (
  <ConfirmScreen
    title="Send transaction"
    confirmButtonText="Sign"
    onSubmit={() => {
      onSubmit(transaction)
    }}
    {...props}
  >
    <P>A dapp wants you to make this transaction:</P>
    <Pre>{JSON.stringify(transaction, null, 2)}</Pre>
  </ConfirmScreen>
)
