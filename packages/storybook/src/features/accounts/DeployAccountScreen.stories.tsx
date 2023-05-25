import { DeployAccountScreen } from "@argent-x/extension/src/ui/features/accounts/DeployAccountScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: DeployAccountScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
