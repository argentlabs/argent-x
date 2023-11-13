import { AppBackgroundError } from "@argent-x/extension/src/ui/AppBackgroundError"
import { decorators } from "../../decorators/routerDecorators"

export default {
  component: AppBackgroundError,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {},
}
