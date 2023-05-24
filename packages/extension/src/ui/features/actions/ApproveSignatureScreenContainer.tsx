import { FC } from "react"
import type { typedData } from "starknet"

import { usePageTracking } from "../../services/analytics"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { DeployAccountScreenContainer } from "../accounts/DeployAccountScreenContainer"
import { useCheckUpgradeAvailable } from "../accounts/upgrade.service"
import { UpgradeScreenV4Container } from "../accounts/UpgradeScreenV4Container"
import { useFeeTokenBalance } from "../accountTokens/tokens.service"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { RemovedMultisigWarningScreen } from "../multisig/RemovedMultisigWarningScreen"
import { ApproveSignatureScreen } from "./ApproveSignatureScreen"
import { ConfirmPageProps } from "./transaction/ApproveTransactionScreen/ConfirmScreen"

interface ApproveSignatureScreenContainerProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  dataToSign: typedData.TypedData
  onSubmit: (data: typedData.TypedData) => void
  onReject: () => void
}

export const ApproveSignatureScreenContainer: FC<
  ApproveSignatureScreenContainerProps
> = ({ dataToSign, onSubmit, selectedAccount, ...props }) => {
  usePageTracking("signMessage")

  const { needsUpgrade = false } = useCheckUpgradeAvailable(selectedAccount)
  const { feeTokenBalance } = useFeeTokenBalance(selectedAccount)
  const { pendingTransactions = [] } = useAccountTransactions(selectedAccount)
  const multisig = useMultisig(selectedAccount)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)

  const hasUpgradeTransactionPending = pendingTransactions.some(
    (t) => t.meta?.isUpgrade,
  )
  const shouldShowUpgrade = Boolean(
    needsUpgrade && feeTokenBalance?.gt(0) && !hasUpgradeTransactionPending,
  )

  if (selectedAccount?.needsDeploy && !selectedAccount.deployTransaction) {
    return <DeployAccountScreenContainer {...props} />
  }

  if (multisig && !signerIsInMultisig) {
    return <RemovedMultisigWarningScreen />
  }

  if (shouldShowUpgrade) {
    return <UpgradeScreenV4Container upgradeType="account" {...props} />
  }

  return (
    <ApproveSignatureScreen
      dataToSign={dataToSign}
      onSubmit={() => {
        onSubmit(dataToSign)
      }}
      {...props}
    />
  )
}
