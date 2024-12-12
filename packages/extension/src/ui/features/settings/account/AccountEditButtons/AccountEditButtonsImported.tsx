import { HideOrDeleteAccountButtonContainer } from "./buttons/HideOrDeleteAccountButton"
import { ViewOnExplorerButtonContainer } from "./buttons/ViewOnExplorerButton"
import { PrivateKeyExportButtonContainer } from "./buttons/PrivateKeyExportButton"
import { PublicKeyExportButtonContainer } from "./buttons/PublicKeyExportButton"
import type { WalletAccount } from "../../../../../shared/wallet.model"

export const AccountEditButtonsImported = ({
  account,
}: {
  account: WalletAccount
}) => {
  return (
    <>
      <ViewOnExplorerButtonContainer account={account} />
      <HideOrDeleteAccountButtonContainer account={account} type="hide" />
      <PublicKeyExportButtonContainer account={account} />
      <PrivateKeyExportButtonContainer account={account} action="reveal" />
      <HideOrDeleteAccountButtonContainer account={account} type="remove" />
    </>
  )
}
