import { FC } from "react"

import { WalletAccount } from "../../../shared/wallet.model"
import { SignatureRequestRejectedScreen } from "../actions/SignatureRequestRejectedScreen"

interface MultisigSignatureScreenWarningProps {
  selectedAccount?: WalletAccount
  onReject: () => void
}

export const MultisigSignatureScreenWarning: FC<
  MultisigSignatureScreenWarningProps
> = ({ selectedAccount, onReject }) => {
  return (
    <SignatureRequestRejectedScreen
      onReject={onReject}
      selectedAccount={selectedAccount}
      error={"Off-chain signatures are not yet supported for multisig accounts"}
    />
  )
}
