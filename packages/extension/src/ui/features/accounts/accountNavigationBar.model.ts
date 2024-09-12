import { NavigationBarProps } from "@argent/x-ui"
import { ReactEventHandler } from "react"

export interface AccountNavigationBarProps
  extends AccountNavigationBarContainerProps {
  accountName?: string
  isSmartAccount?: boolean
  isMultisig?: boolean
  isLedgerAccount?: boolean
  onAccountList?: ReactEventHandler
  onSettings?: ReactEventHandler
  envLabel?: string
}

export interface AccountNavigationBarContainerProps
  extends Pick<NavigationBarProps, "scroll"> {
  showAccountButton?: boolean
  showNetworkSwitcher?: boolean
  showSettingsButton?: boolean
}
