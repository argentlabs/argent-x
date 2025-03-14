import type Emittery from "emittery"
import type {
  ActionHash,
  ActionQueueItemMeta,
} from "../../../shared/actionQueue/schema"
import type { IActionService } from "../../../shared/actionQueue/service/IActionService"
import type {
  ActionItem,
  ExtQueueItem,
} from "../../../shared/actionQueue/types"

export interface IBackgroundActionService extends IActionService {
  readonly emitter: Emittery<Events>
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

export const TransactionCreatedForAction = Symbol("TransactionCreatedForAction")
export const TransactionIntentCreatedForAction = Symbol(
  "TransactionIntentCreatedForAction",
)
export type Events = {
  [TransactionCreatedForAction]: {
    actionHash: ActionHash
    transactionHash: string
  }
  [TransactionIntentCreatedForAction]: {
    actionHash: ActionHash
    accountAddress: string
    networkId: string
    accountId: string
    txHash: string
  }
}
