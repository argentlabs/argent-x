import { ArgentAccountBaseEmailScreen } from "@argent-x/extension/src/ui/features/argentAccount/ArgentAccountBaseEmailScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ArgentAccountBaseEmailScreen,
  decorators,
  parameters: {
    flow: "argentAccount",
  },
}

export const ThroughSmartAccount = {
  args: {
    flow: "toggleSmartAccount",
  },
}
