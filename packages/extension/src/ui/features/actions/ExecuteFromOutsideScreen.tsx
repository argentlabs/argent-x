import { FC } from "react"

import { SignatureRequestRejectedScreen } from "./SignatureRequestRejectedScreen"
import { WalletAccount } from "../../../shared/wallet.model"

interface ExecuteFromOutsideScreenProps {
  onReject: () => void
  selectedAccount?: WalletAccount
}

export const ExecuteFromOutsideScreen: FC<ExecuteFromOutsideScreenProps> = ({
  onReject,
  selectedAccount,
}) => {
  return (
    <SignatureRequestRejectedScreen
      onReject={onReject}
      selectedAccount={selectedAccount}
      error={"Off-chain signatures for meta transactions are not yet supported"}
    />
  )
}
