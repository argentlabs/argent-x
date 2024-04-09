import { BlockExplorerSettingsScreen } from "@argent-x/extension/src/ui/features/settings/preferences/BlockExplorerSettingsScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: BlockExplorerSettingsScreen,
  decorators,
}

export const Default = {
  args: {
    blockExplorerKey: "starkScan",
  },
}
