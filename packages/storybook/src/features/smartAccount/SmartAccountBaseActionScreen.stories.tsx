import { SmartAccountBaseActionScreen } from "@argent-x/extension/src/ui/features/smartAccount/SmartAccountBaseActionScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SmartAccountBaseActionScreen,
  decorators,
}

export const Add = {
  args: {},
}

export const Remove = {
  args: {
    guardian: "0x123",
  },
}
