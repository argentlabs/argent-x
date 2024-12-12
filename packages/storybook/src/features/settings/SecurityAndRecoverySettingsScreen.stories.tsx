import { SecurityAndRecoverySettingsScreen } from "@argent-x/extension/src/ui/features/settings/securityAndRecovery/SecurityAndRecoverySettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SecurityAndRecoverySettingsScreen,
  decorators,
}

export const Default = {
  args: {
    settings: {
      privacyAutomaticErrorReporting: true,
    },
  },
}
