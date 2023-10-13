import { getActionQueue } from "./queue/queue"
import { actionQueueRepo } from "./store"
import { ActionItem } from "./types"

export const actionQueue = getActionQueue<ActionItem>(actionQueueRepo)
