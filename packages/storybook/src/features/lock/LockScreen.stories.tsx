import { LockScreen } from "@argent-x/extension/src/ui/features/lock/LockScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: LockScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
