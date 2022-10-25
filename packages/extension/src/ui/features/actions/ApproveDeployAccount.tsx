import { isArray } from "lodash-es"
import { FC, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { Call } from "starknet"

import { isErc20TransferCall } from "../../../shared/call"
import {
  ApiTransactionReviewResponse,
  getTransactionReviewHasSwap,
} from "../../../shared/transactionReview.service"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { useCheckUpgradeAvailable } from "../accounts/upgrade.service"
import { UpgradeScreenV4 } from "../accounts/UpgradeScreenV4"
import { useFeeTokenBalance } from "../accountTokens/tokens.service"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { AccountDeploymentFeeEstimation } from "./feeEstimation/AccountDeploymentFeeEstimation"
import { FeeEstimation } from "./feeEstimation/FeeEstimation"
import { AccountAddressField } from "./transaction/fields/AccountAddressField"
import { TransactionsList } from "./transaction/TransactionsList"
import { useTransactionReview } from "./transaction/useTransactionReview"

export interface ApproveDeployAccountScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  onSubmit: () => void
}

export const ApproveDeployAccountScreen: FC<
  ApproveDeployAccountScreenProps
> = ({ selectedAccount, actionHash, onSubmit, ...props }) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(false)
  const { accountClassHash, id: networkId } = useCurrentNetwork()
  const tokensByNetwork = useTokensInNetwork(networkId)

  const { feeTokenBalance } = useFeeTokenBalance(selectedAccount)

  const { needsUpgrade = false } = useCheckUpgradeAvailable(selectedAccount)

  const shouldBeUpgraded = Boolean(needsUpgrade && feeTokenBalance?.gt(0))

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <ConfirmScreen
      title="Review activation"
      confirmButtonText="Approve"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={onSubmit}
      showHeader={false}
      //   footer={
      //     selectedAccount.needsDeploy && (
      //       <AccountDeploymentFeeEstimation
      //         onErrorChange={setDisableConfirm}
      //         accountAddress={selectedAccount.address}
      //         networkId={selectedAccount.networkId}
      //         actionHash={actionHash}
      //       />
      //     )
      //   }
      {...props}
    >
      {/* <TransactionsList
        networkId={networkId}
        transactions={transactions}
        transactionReview={transactionReview}
        tokensByNetwork={tokensByNetwork}
      /> */}
      <FieldGroup>
        <AccountAddressField
          title="From"
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.network.id}
        />
        <Field>
          <FieldKey>Network</FieldKey>
          <FieldValue>{selectedAccount.network.name}</FieldValue>
        </Field>
      </FieldGroup>
    </ConfirmScreen>
  )
}
