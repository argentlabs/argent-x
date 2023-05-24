import { IStatusMessage } from "@argent-x/extension/src/shared/statusMessage/types"
import { StatusMessageBanner } from "@argent-x/extension/src/ui/features/statusMessage/StatusMessageBanner"

import statusMessages from "./__fixtures__/status-messages.json"

export default {
  component: StatusMessageBanner,
}

export const Danger = {
  args: {
    statusMessage: statusMessages.danger as IStatusMessage,
  },
}

export const Warn = {
  args: {
    statusMessage: statusMessages.warn as IStatusMessage,
  },
}

export const Info = {
  args: {
    statusMessage: statusMessages.info as IStatusMessage,
  },
}

export const Null = {
  args: {
    statusMessage: statusMessages.null as IStatusMessage,
  },
}
