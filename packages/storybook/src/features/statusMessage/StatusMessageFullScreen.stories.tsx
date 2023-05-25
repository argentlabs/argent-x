import { IStatusMessage } from "@argent-x/extension/src/shared/statusMessage/types"
import { StatusMessageFullScreen } from "@argent-x/extension/src/ui/features/statusMessage/StatusMessageFullScreen"

import statusMessages from "./__fixtures__/status-messages.json"

export default {
  component: StatusMessageFullScreen,
  parameters: {
    layout: "fullscreen",
  },
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
