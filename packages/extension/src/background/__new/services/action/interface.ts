import {
  ActionHash,
  ActionQueueItemMeta,
} from "../../../../shared/actionQueue/schema"
import type { IActionService } from "../../../../shared/actionQueue/service/interface"
import type {
  ActionItem,
  ExtQueueItem,
} from "../../../../shared/actionQueue/types"

export interface IBackgroundActionService extends IActionService {
  add<T extends ActionItem>(
    action: T,
    meta?: Partial<ActionQueueItemMeta>,
  ): Promise<ExtQueueItem<T>>
  addFront<T extends ActionItem>(
    action: T,
    meta?: Partial<ActionQueueItemMeta>,
  ): Promise<ExtQueueItem<T>>
  remove(actionHash: ActionHash): Promise<ExtQueueItem<ActionItem> | null>
}
