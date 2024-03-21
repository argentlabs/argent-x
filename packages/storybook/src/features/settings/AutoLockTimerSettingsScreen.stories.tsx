import { AutoLockTimerSettingsScreen } from "@argent-x/extension/src/ui/features/settings/securityAndPrivacy/AutoLockTimerSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AutoLockTimerSettingsScreen,
  decorators,
}

export const Default = {
  args: {
    autoLockTimeMinutes: 30,
  },
}
