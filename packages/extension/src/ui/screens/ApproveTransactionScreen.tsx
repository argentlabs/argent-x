import { BigNumber } from "ethers"
import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call, InvokeFunctionTransaction, encode } from "starknet"
import styled from "styled-components"

import { FeeEstimate } from "../components/FeeEstimate"
import { routes } from "../routes"
import { updateTransactionFee } from "../utils/messaging"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"

interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transactions: Call | Call[] | InvokeFunctionTransaction // TODO: remove InvokeFunctionTransaction when removing legacy transaction support
  onSubmit: (transactions: Call | Call[] | InvokeFunctionTransaction) => void
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
  const [disableConfirm, setDisableConfirm] = useState(false)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <ConfirmScreen
      title="Send transaction"
      confirmButtonText="Sign"
      disableConfirm={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        onSubmit(transactions)
      }}
      footer={
        <FeeEstimate
          onChange={async (x) => {
            setDisableConfirm(true)
            await updateTransactionFee(
              actionHash,
              encode.addHexPrefix(x.toHexString()),
            )
            setDisableConfirm(false)
          }}
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.networkId}
          // if transactions is InvokeFunctionTransaction, we need to pass maxFee to the component. Otherwise, we can just pass transactions
          {...("type" in transactions
            ? { maxFee: BigNumber.from("0") }
            : { transactions })}
        />
      }
      {...props}
    >
      <Pre>{JSON.stringify(transactions, null, 2)}</Pre>
    </ConfirmScreen>
  )
}
