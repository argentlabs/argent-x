import { DeveloperSettingsScreen } from "@argent-x/extension/src/ui/features/settings/developerSettings/DeveloperSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: DeveloperSettingsScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
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
