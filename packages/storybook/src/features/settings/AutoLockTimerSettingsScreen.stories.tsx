import { AutoLockTimerSettingsScreen } from "@argent-x/extension/src/ui/features/settings/securityAndPrivacy/AutoLockTimerSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AutoLockTimerSettingsScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    autoLockTimeMinutes: 30,
  },
}
