import { SecurityAndPrivacySettingsScreen } from "@argent-x/extension/src/ui/features/settings/securityAndPrivacy/SecurityAndPrivacySettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SecurityAndPrivacySettingsScreen,
  decorators,
}

export const Default = {
  args: {
    settings: {
      privacyAutomaticErrorReporting: true,
    },
  },
}
