import type { FC, ReactEventHandler } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import type { NavigationBarProps } from "@argent/x-ui"
import { multisigView } from "../../features/multisig/multisig.state"
import { useIsLedgerSigner } from "../../features/ledger/hooks/useIsLedgerSigner"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { ENABLE_SIDE_PANEL } from "../../../shared/ui/constants"
import { settingsStore } from "../../../shared/settings/store"
import { useExtensionIsInSidePanel } from "../browser/tabs"
import { useGetSetKeyValueStorage } from "../../hooks/useStorage"
import { useOpenExtensionInSidePanel } from "../browser/tabs"
import { ampli } from "../../../shared/analytics"

const argentXEnv = process.env.ARGENT_X_ENVIRONMENT || ""

export interface AccountNavigationBarContainerProps
  extends Pick<NavigationBarProps, "scroll"> {
  showSettingsButton?: boolean
  showSidePanelButton?: boolean
  onSidePanelClick?: ReactEventHandler
}

export const AccountNavigationBarContainer: FC<
  AccountNavigationBarContainerProps
> = (props) => {
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()
  const currentNetwork = useCurrentNetwork()

  const account = useView(selectedAccountView)
  const multisig = useView(multisigView(account))

  const isGuardian = Boolean(account?.guardian)
  const isMultisig = Boolean(multisig)

  const isLedgerAccount = useIsLedgerSigner(account?.id) && !isMultisig // Multisig has higher icon priority

  const onAccountList = useCallback(() => {
    navigate(routes.accounts(returnTo))
  }, [returnTo, navigate])

  const openExtensionInSidePanel = useOpenExtensionInSidePanel()
  const extensionIsInSidePanel = useExtensionIsInSidePanel()
  const [sidePanelEnabled, setSidePanelEnabled] = useGetSetKeyValueStorage(
    settingsStore,
    "sidePanelEnabled",
  )
  const onEnableSidePanelClick = useCallback(() => {
    setSidePanelEnabled(!sidePanelEnabled)
    if (!sidePanelEnabled) {
      void openExtensionInSidePanel()
    }
  }, [sidePanelEnabled, setSidePanelEnabled, openExtensionInSidePanel])

  const showSidePanelButton = ENABLE_SIDE_PANEL

  const envLabel = argentXEnv === "hydrogen" ? "Hydrogen" : undefined

  return (
    <AccountNavigationBar
      accountName={account?.name}
      accountId={account?.id}
      accountType={account?.type}
      isSmartAccount={isGuardian}
      isMultisig={isMultisig}
      isLedgerAccount={isLedgerAccount}
      onAccountList={onAccountList}
      showSidePanelButton={showSidePanelButton}
      onSidePanelClick={onEnableSidePanelClick}
      extensionIsInSidePanel={extensionIsInSidePanel}
      envLabel={envLabel}
      networkName={currentNetwork?.name}
      avtarMeta={account?.avatarMeta}
      {...props}
    />
  )
}
