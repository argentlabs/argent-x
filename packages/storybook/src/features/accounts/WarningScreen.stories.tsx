import { WarningScreen } from "@argent-x/extension/src/ui/features/accounts/WarningScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: WarningScreen,
  decorators,
}

export const Default = {
  args: {
    title: "This is warning title",
    description: "You cannot do this because of the warning",
    buttonLabel: "Back to my accounts",
  },
}
