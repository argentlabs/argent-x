import { AccountNavigationBar } from "@argent-x/extension/src/ui/features/accounts/AccountNavigationBar"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AccountNavigationBar,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    accountName: "Account 1",
  },
}

export const Shield = {
  args: {
    isShield: true,
    accountName: "Account 1",
  },
}

export const Multisig = {
  args: {
    isMultisig: true,
    accountName: "Account 1",
  },
}

export const HideAccountButton = {
  args: {
    showAccountButton: false,
  },
}

export const OnlySettings = {
  args: {
    showAccountButton: false,
    showNetworkSwitcher: false,
  },
}
