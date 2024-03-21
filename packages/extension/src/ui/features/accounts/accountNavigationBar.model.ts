import { NavigationBarProps } from "@argent/x-ui"
import { ReactEventHandler } from "react"

export interface AccountNavigationBarProps
  extends AccountNavigationBarContainerProps {
  accountName?: string
  isShield?: boolean
  isMultisig?: boolean
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
