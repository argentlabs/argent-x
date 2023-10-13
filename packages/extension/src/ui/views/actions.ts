import { atom } from "jotai"

import { actionQueue } from "../../shared/actionQueue"
import { actionQueueRepo } from "../../shared/actionQueue/store"
import { atomWithSubscription } from "./implementation/atomWithSubscription"

// Action queue views

export const userClickedAddFundsAtom = atom(false)

/** Use the queue and getAll() so that queue expiry rules will run */
export const allActionsView = atomWithSubscription(
  () => actionQueue.getAll(),
  (next) =>
    // subscribe for changes on the underlying storage
    actionQueueRepo.subscribe(async () =>
      // newValue and get return the same reference when changing. While this usually is nice for performance, it breaks react rerenders, so we need to clone the array.
      next([...(await actionQueue.getAll())]),
    ),
)

export const currentActionView = atom(async (get) => {
  const actions = await get(allActionsView)
  if (actions.length > 0) {
    return actions[0]
  }
})

export const hasActionsView = atom(async (get) => {
  const actions = await get(allActionsView)
  return actions.length > 0
})

export const isLastActionView = atom(async (get) => {
  const actions = await get(allActionsView)
  return actions.length === 1
})
