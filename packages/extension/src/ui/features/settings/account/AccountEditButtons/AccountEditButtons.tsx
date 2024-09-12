import { SpacerCell } from "@argent/x-ui"
import { FC } from "react"
import { AccountEditButtonsLedger } from "./AccountEditButtonsLedger"
import { ConnectedDappButtonContainer } from "./buttons/ConnectedDappsButton"
import { DeployAccountButtonContainer } from "./buttons/DeployAccountButton"
import { HideOrDeleteAccountButtonContainer } from "./buttons/HideOrDeleteAccountButton"
import { PrivateKeyExportButtonContainer } from "./buttons/PrivateKeyExportButton"
import { PublicKeyExportButtonContainer } from "./buttons/PublicKeyExportButton"
import { SmartAccountToggleButtonContainer } from "./buttons/SmartAccountToggleButton"
import { ViewOnExplorerButtonContainer } from "./buttons/ViewOnExplorerButton"
import { WalletAccount } from "../../../../../shared/wallet.model"

export const AccountEditButtons: FC<{
  account: WalletAccount
  isLedger: boolean
}> = ({ account, isLedger }) => {
  if (isLedger) {
    return (
      <>
        <ViewOnExplorerButtonContainer account={account} />
        <ConnectedDappButtonContainer account={account} />
        <HideOrDeleteAccountButtonContainer account={account} />
        <DeployAccountButtonContainer account={account} />
        <AccountEditButtonsLedger account={account} />
      </>
    )
  }

  return (
    <>
      <SmartAccountToggleButtonContainer account={account} />
      <SpacerCell />
      <ViewOnExplorerButtonContainer account={account} />
      <HideOrDeleteAccountButtonContainer account={account} />
      <DeployAccountButtonContainer account={account} />
      <ConnectedDappButtonContainer account={account} />
      <PublicKeyExportButtonContainer account={account} />
      <PrivateKeyExportButtonContainer account={account} />
    </>
  )
}
