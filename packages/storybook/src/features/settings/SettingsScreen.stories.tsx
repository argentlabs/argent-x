import { SettingsScreen } from "@argent-x/extension/src/ui/features/settings/SettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SettingsScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
