import { SmartAccountBaseOTPScreen } from "@argent-x/extension/src/ui/features/smartAccount/SmartAccountBaseOTPScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SmartAccountBaseOTPScreen,
  decorators,
}
export const Default = {
  args: {
    email: "example@example.com",
  },
}
