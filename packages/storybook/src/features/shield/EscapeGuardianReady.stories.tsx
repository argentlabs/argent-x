import { EscapeGuardianReady } from "@argent-x/extension/src/ui/features/shield/escape/EscapeGuardianReady"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: EscapeGuardianReady,
  decorators,
}

export const Step1 = {
  args: {
    accountGuardianIsSelf: false,
  },
}

export const Step2 = {
  args: {
    accountGuardianIsSelf: true,
  },
}
