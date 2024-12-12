import { IStatusMessage } from "@argent-x/extension/src/shared/statusMessage/types"

import dangerStatusMessage from "./danger.json"
import warningStatusMessage from "./warning.json"
import infoStatusMessage from "./info.json"
import upgradeStatusMessage from "./upgrade.json"
import nullStatusMessage from "./null.json"

export const statusMessages = {
  danger: dangerStatusMessage,
  warning: warningStatusMessage,
  info: infoStatusMessage,
  upgrade: upgradeStatusMessage,
  null: nullStatusMessage,
} as Record<string, IStatusMessage>
