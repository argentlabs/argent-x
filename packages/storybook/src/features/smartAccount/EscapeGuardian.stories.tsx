import { ESCAPE_TYPE_GUARDIAN } from "@argent-x/extension/src/shared/account/details/escape.model"
import { EscapeGuardian } from "@argent-x/extension/src/ui/features/smartAccount/escape/EscapeGuardian"
import { getActiveFromNow } from "@argent-x/extension/src/ui/features/smartAccount/escape/useAccountEscape"

import { decorators } from "../../decorators/routerDecorators"

const activeAtNow = new Date().getTime() / 1000

const activeAt5m = activeAtNow + 60 * 5
const activeAt5h = activeAtNow + 60 * 60 * 5
const activeAt5d = activeAtNow + 24 * 60 * 60 * 5

export default {
  component: EscapeGuardian,
  decorators,
}

export const SmartAccount5Days = {
  args: {
    liveAccountEscape: {
      activeAt: activeAt5d,
      type: ESCAPE_TYPE_GUARDIAN,
      ...getActiveFromNow(activeAt5d),
    },
  },
}

export const SmartAccount5Hours = {
  args: {
    liveAccountEscape: {
      activeAt: activeAt5h,
      type: ESCAPE_TYPE_GUARDIAN,
      ...getActiveFromNow(activeAt5h),
    },
  },
}

export const SmartAccount5Minutes = {
  args: {
    liveAccountEscape: {
      activeAt: activeAt5m,
      type: ESCAPE_TYPE_GUARDIAN,
      ...getActiveFromNow(activeAt5m),
    },
  },
}
