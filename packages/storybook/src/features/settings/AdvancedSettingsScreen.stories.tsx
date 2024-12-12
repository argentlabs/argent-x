import { AdvancedSettingsScreen } from "@argent-x/extension/src/ui/features/settings/advanced/AdvancedSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AdvancedSettingsScreen,
  decorators,
}

export const Default = {
  args: {},
}

export const All = {
  args: {
    showBetaFeatures: true,
    showExperimentalSettings: true,
  },
}
