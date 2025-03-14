import { KeyValueStorage } from "../storage"
import type { IDevStorage } from "./types"

export const devStore = new KeyValueStorage<IDevStorage>(
  {
    openInExtendedView: false,
    locationLoggerEnabled: false,
    atomsDevToolsEnabled: false,
    atomsDebugValueEnabled: false,
  },
  "dev:settings",
)
