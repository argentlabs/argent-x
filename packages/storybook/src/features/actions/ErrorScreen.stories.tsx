import { ErrorScreen } from "@argent-x/extension/src/ui/features/actions/ErrorScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ErrorScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
  },
}
