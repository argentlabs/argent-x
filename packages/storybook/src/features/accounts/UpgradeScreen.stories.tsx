import { UpgradeScreen } from "@argent-x/extension/src/ui/features/accounts/UpgradeScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: UpgradeScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
