import { ShieldAccountActivate } from "@argent-x/extension/src/ui/features/shield/ShieldAccountActivate"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ShieldAccountActivate,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
