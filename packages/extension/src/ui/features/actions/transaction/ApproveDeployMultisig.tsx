import { FC, useState } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../../routes"
import { DeployAccountFeeEstimation } from "../feeEstimation/DeployAccountFeeEstimation"
import { AccountNetworkInfoArgentX } from "./ApproveTransactionScreen/AccountNetworkInfoArgentX"
import {
  ConfirmPageProps,
  ConfirmScreen,
} from "./ApproveTransactionScreen/ConfirmScreen"
import { DappHeaderArgentX } from "./ApproveTransactionScreen/DappHeader/DappHeaderArgentX"
import { TransactionActions } from "./ApproveTransactionScreen/TransactionActions"
import { WithActionScreenErrorFooter } from "./ApproveTransactionScreen/WithActionScreenErrorFooter"
import { ApproveScreenType } from "./types"

interface ApproveDeployMultisigScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  onSubmit: () => void
  actionIsApproving?: boolean
}

export const ApproveDeployMultisig: FC<ApproveDeployMultisigScreenProps> = ({
  selectedAccount,
  actionHash,
  onSubmit,
  actionIsApproving,
  ...rest
}) => {
  const [disableConfirm, setDisableConfirm] = useState(true)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <ConfirmScreen
      rejectButtonText="Cancel"
      confirmButtonDisabled={disableConfirm || actionIsApproving}
      confirmButtonIsLoading={actionIsApproving}
      selectedAccount={selectedAccount}
      onSubmit={onSubmit}
      showHeader={true}
      footer={
        <WithActionScreenErrorFooter isTransaction>
          <DeployAccountFeeEstimation
            accountAddress={selectedAccount.address}
            actionHash={actionHash}
            networkId={selectedAccount.networkId}
            onErrorChange={setDisableConfirm}
            transactionSimulationLoading={false}
          />
        </WithActionScreenErrorFooter>
      }
      {...rest}
    >
      {/** Use Transaction Review to get DappHeader */}
      <DappHeaderArgentX
        approveScreenType={ApproveScreenType.MULTISIG_DEPLOY}
      />

      <TransactionActions
        action={{
          type: "DEPLOY_ACCOUNT",
          payload: {
            accountAddress: selectedAccount.address,
            classHash:
              selectedAccount.network.accountClassHash?.[selectedAccount.type],
            type: selectedAccount.type,
          },
        }}
      />

      <AccountNetworkInfoArgentX account={selectedAccount} />
    </ConfirmScreen>
  )
}
