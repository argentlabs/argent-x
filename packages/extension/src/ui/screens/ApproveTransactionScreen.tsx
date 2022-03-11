import { FC } from "react"
import type { Call, InvokeFunctionTransaction } from "starknet"
import styled from "styled-components"

import { P } from "../components/Typography"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"

interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  transactions: Call | Call[] | InvokeFunctionTransaction // TODO: remove InvokeFunctionTransaction when removing legacy transaction support
  onSubmit: (transactions: Call | Call[] | InvokeFunctionTransaction) => void
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
  transactions,
  onSubmit,
  ...props
}) => (
  <ConfirmScreen
    title="Send transaction"
    confirmButtonText="Sign"
    onSubmit={() => {
      onSubmit(transactions)
    }}
    {...props}
  >
    <P>A dapp wants you to make this transaction:</P>
    <Pre>{JSON.stringify(transactions, null, 2)}</Pre>
  </ConfirmScreen>
)
