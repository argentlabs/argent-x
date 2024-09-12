import { HideOrDeleteAccountButtonContainer } from "./buttons/HideOrDeleteAccountButton"
import { ViewOnExplorerButtonContainer } from "./buttons/ViewOnExplorerButton"
import { PrivateKeyExportButtonContainer } from "./buttons/PrivateKeyExportButton"
import { MultisigThresholdButtonContainer } from "./buttons/MultisigThresholdButton"
import { MultisigOwnersButtonContainer } from "./buttons/MultisigOwnersButton"
import { AccountEditButtonsLedger } from "./AccountEditButtonsLedger"
import { PublicKeyExportButtonContainer } from "./buttons/PublicKeyExportButton"
import { WalletAccount } from "../../../../../shared/wallet.model"

export const AccountEditButtonsMultisig = ({
  account,
  isLedger,
}: {
  account: WalletAccount
  isLedger: boolean
}) => {
  return (
    <>
      <ViewOnExplorerButtonContainer account={account} />
      <HideOrDeleteAccountButtonContainer account={account} />
      <MultisigOwnersButtonContainer account={account} />
      <MultisigThresholdButtonContainer account={account} />
      {!isLedger && (
        <>
          <PublicKeyExportButtonContainer account={account} />
          <PrivateKeyExportButtonContainer account={account} />
        </>
      )}
      {isLedger && <AccountEditButtonsLedger account={account} />}
    </>
  )
}
