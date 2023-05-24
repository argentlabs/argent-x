import { UpgradeScreenV4 } from "@argent-x/extension/src/ui/features/accounts/UpgradeScreenV4"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: UpgradeScreenV4,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    upgradeType: "account",
  },
}

export const NetworkUpgradeV4 = {
  args: {
    upgradeType: "network",
    v4UpgradeAvailableOnMainnet: true,
  },
}

export const NetworkUpgradeV4Hidden = {
  args: {
    upgradeType: "network",
    v4UpgradeAvailableOnHiddenMainnet: true,
  },
}

export const NetworkUpgradeV4Both = {
  args: {
    upgradeType: "network",
    v4UpgradeAvailableOnMainnet: true,
    v4UpgradeAvailableOnTestnet: true,
  },
}

export const NetworkUpgradeV4HiddenBoth = {
  args: {
    upgradeType: "network",
    v4UpgradeAvailableOnHiddenMainnet: true,
    v4UpgradeAvailableOnTestnet: true,
  },
}

export const NetworkUpgradeV4Testnet = {
  args: {
    upgradeType: "network",
    v4UpgradeAvailableOnMainnet: false,
    v4UpgradeAvailableOnTestnet: true,
  },
}
