import { HeaderCell } from "@argent/x-ui"
import type { FC } from "react"
import { AccountEditButtonsLedger } from "./AccountEditButtonsLedger"
import { ConnectedDappButtonContainer } from "./buttons/ConnectedDappsButton"
import { DeployAccountButtonContainer } from "./buttons/DeployAccountButton"
import { HideOrDeleteAccountButtonContainer } from "./buttons/HideOrDeleteAccountButton"
import { PrivateKeyExportButtonContainer } from "./buttons/PrivateKeyExportButton"
import { PublicKeyExportButtonContainer } from "./buttons/PublicKeyExportButton"
import { SmartAccountToggleButtonContainer } from "./buttons/SmartAccountToggleButton"
import { ViewOnExplorerButtonContainer } from "./buttons/ViewOnExplorerButton"
import { SecurityPeriodButtonContainer } from "./buttons/SecurityPeriodButton"
import { RemoveGuardianButtonContainer } from "./buttons/RemoveGuardianButton"
import type { WalletAccount } from "../../../../../shared/wallet.model"

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
      {account.type === "smart" && (
        <HeaderCell mt={"4 !important"}>
          Advanced smart account settings
        </HeaderCell>
      )}
      <SecurityPeriodButtonContainer account={account} />
      <RemoveGuardianButtonContainer account={account} />
      <HeaderCell>General account settings</HeaderCell>
      <ViewOnExplorerButtonContainer account={account} />
      <HideOrDeleteAccountButtonContainer account={account} />
      <DeployAccountButtonContainer account={account} />
      <ConnectedDappButtonContainer account={account} />
      <PublicKeyExportButtonContainer account={account} />
      <PrivateKeyExportButtonContainer account={account} />
    </>
  )
}
