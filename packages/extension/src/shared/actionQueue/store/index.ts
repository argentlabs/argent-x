import { ArrayStorage } from "../../storage"
import type { IRepository } from "../../storage/__new/interface"
import { adaptArrayStorage } from "../../storage/__new/repository"
import type { ExtensionActionItem } from "../types"

export type IActionQueueRepo = IRepository<ExtensionActionItem>

export const compareExtensionActionItems = (
  a: ExtensionActionItem,
  b: ExtensionActionItem,
) => a.meta.hash === b.meta.hash

/**
 * @deprecated use `actionQueueRepo` instead
 */
export const globalActionQueueStore = new ArrayStorage<ExtensionActionItem>(
  [],
  {
    namespace: "core:actionQueue",
    areaName: "local",
    compare: compareExtensionActionItems,
  },
)

export const actionQueueRepo: IActionQueueRepo = adaptArrayStorage(
  globalActionQueueStore,
)
