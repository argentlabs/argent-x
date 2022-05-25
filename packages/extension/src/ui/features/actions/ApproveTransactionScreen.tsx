import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"
import styled from "styled-components"

import { routes } from "../../routes"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { FeeEstimation } from "./FeeEstimation"

interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transactions: Call | Call[]
  onSubmit: (transactions: Call | Call[]) => void
}

const Pre = styled.pre`
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  max-width: calc(100vw - 64px);
  overflow: auto;
  background: #161616;
`

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transactions,
  selectedAccount,
  actionHash,
  onSubmit,
  ...props
}) => {
  const [disableConfirm, setDisableConfirm] = useState(true)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <ConfirmScreen
      title="Send transaction"
      confirmButtonText="Sign"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        onSubmit(transactions)
      }}
      footer={
        <FeeEstimation
          onErrorChange={(hasError) => {
            if (hasError) {
              setDisableConfirm(true)
            } else {
              setDisableConfirm(false)
            }
          }}
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.networkId}
          transactions={transactions}
        />
      }
      {...props}
    >
      <Pre>{JSON.stringify(transactions, null, 2)}</Pre>
    </ConfirmScreen>
  )
}
