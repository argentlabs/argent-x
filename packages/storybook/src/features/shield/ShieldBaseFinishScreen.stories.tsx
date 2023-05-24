import { ShieldBaseFinishScreen } from "@argent-x/extension/src/ui/features/shield/ShieldBaseFinishScreen"
import { ChangeGuardian } from "@argent-x/extension/src/ui/features/shield/usePendingChangingGuardian"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ShieldBaseFinishScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Removed = {
  args: {
    accountName: "Account 1",
  },
}

export const Adding = {
  args: {
    accountName: "Account 1",
    pendingChangeGuardian: ChangeGuardian.ADDING,
  },
}

export const Added = {
  args: {
    accountName: "Account 1",
    guardian: "0x123",
  },
}

export const Removing = {
  args: {
    accountName: "Account 1",
    pendingChangeGuardian: ChangeGuardian.REMOVING,
  },
}
