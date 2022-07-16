import { ArrayStorage } from "../storage"
import { ExtensionActionItem } from "./types"

export const globalActionQueueStore = new ArrayStorage<ExtensionActionItem>(
  [],
  {
    namespace: "core:actionQueue",
    areaName: "local",
    compare: (a, b) => a.meta.hash === b.meta.hash,
  },
)
