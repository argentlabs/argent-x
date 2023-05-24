import { RecoverySetupScreen } from "@argent-x/extension/src/ui/features/recovery/RecoverySetupScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: RecoverySetupScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
