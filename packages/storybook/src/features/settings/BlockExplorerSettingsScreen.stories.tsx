import { BlockExplorerSettingsScreen } from "@argent-x/extension/src/ui/features/settings/preferences/BlockExplorerSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: BlockExplorerSettingsScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    blockExplorerKey: "starkScan",
  },
}
