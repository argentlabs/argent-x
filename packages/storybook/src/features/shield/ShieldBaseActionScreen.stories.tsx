import { ShieldBaseActionScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseActionScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ShieldBaseActionScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Add = {
  args: {},
}

export const Remove = {
  args: {
    guardian: "0x123",
  },
}
