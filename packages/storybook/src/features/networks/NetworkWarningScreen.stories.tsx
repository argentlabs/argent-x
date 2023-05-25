import { NetworkWarningScreen } from "@argent-x/extension/src/ui/features/networks/NetworkWarningScreen/NetworkWarningScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: NetworkWarningScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
