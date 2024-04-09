import { ShieldBaseOTPScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseOTPScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ShieldBaseOTPScreen,
  decorators,
}
export const Default = {
  args: {
    email: "example@example.com",
  },
}
