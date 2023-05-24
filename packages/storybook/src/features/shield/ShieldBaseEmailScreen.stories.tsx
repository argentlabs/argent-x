import { ShieldBaseEmailScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseEmailScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ShieldBaseEmailScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const HasGuardian = {
  args: {
    hasGuardian: true,
  },
}

export const NoGuardian = {
  args: {
    hasGuardian: false,
  },
}
