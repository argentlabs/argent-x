import { getActionQueue } from "./queue/getActionQueue"
import { actionQueueRepo } from "./store"
import type { ActionItem } from "./types"

export const actionQueue = getActionQueue<ActionItem>(actionQueueRepo)
