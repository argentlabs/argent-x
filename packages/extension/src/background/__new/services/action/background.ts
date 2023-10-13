import { isObject, isString } from "lodash-es"

import { IActionQueue } from "../../../../shared/actionQueue/queue/interface"
import type {
  ActionHash,
  ActionQueueItemMeta,
} from "../../../../shared/actionQueue/schema"
import type {
  ActionItem,
  ExtQueueItem,
  ExtensionActionItem,
} from "../../../../shared/actionQueue/types"
import { MessageType } from "../../../../shared/messages"
import {
  handleActionApproval,
  handleActionRejection,
} from "../../../actionHandlers"
import type { Respond } from "../../../respond"
import { Wallet } from "../../../wallet"
import type { IBackgroundActionService } from "./interface"
import { ActionError } from "../../../../shared/errors/action"

const getResultData = (resultMessage?: MessageType) => {
  if (resultMessage && "data" in resultMessage) {
    return resultMessage.data
  }
}

const getResultDataError = (resultMessage?: MessageType) => {
  const data = getResultData(resultMessage)
  if (isObject(data) && "error" in data) {
    return isString(data.error) ? data.error : "Unknown error"
  }
}

export default class BackgroundActionService
  implements IBackgroundActionService
{
  constructor(
    private queue: IActionQueue<ActionItem>,
    private wallet: Wallet,
    private respond: Respond,
  ) {}

  async approve(input: ExtensionActionItem | ActionHash) {
    const actionHash = isString(input) ? input : input.meta.hash
    const action = await this.queue.get(actionHash)
    await this.queue.updateMeta(actionHash, {
      startedApproving: Date.now(),
      errorApproving: undefined,
    })
    if (!action) {
      throw new ActionError({ code: "NOT_FOUND" })
    }
    /**
     * Don't await handleActionApproval, this allows for existing patterns to use 'waitForMessage' after calling await clientActionService.approve(...)
     */
    handleActionApproval(action, this.wallet)
      .then((resultMessage) => {
        const error = getResultDataError(resultMessage)
        if (error) {
          void this.queue.updateMeta(actionHash, {
            startedApproving: undefined,
            errorApproving: error,
          })
        } else {
          void this.queue.remove(actionHash)
        }
        if (resultMessage) {
          void this.respond(resultMessage)
        }
      })
      .catch((e) => {
        /** handleActionApproval catches exceptions internally so this should never happen */
        throw e
      })
  }

  async approveAndWait(input: ExtensionActionItem | ActionHash) {
    const actionHash = isString(input) ? input : input.meta.hash
    const action = await this.queue.get(actionHash)
    if (!action) {
      throw new ActionError({ code: "NOT_FOUND" })
    }
    await this.queue.updateMeta(actionHash, {
      startedApproving: Date.now(),
      errorApproving: undefined,
    })
    const resultMessage = await handleActionApproval(action, this.wallet)
    const error = getResultDataError(resultMessage)
    if (error) {
      await this.queue.updateMeta(actionHash, {
        startedApproving: undefined,
        errorApproving: error,
      })
    } else {
      await this.queue.remove(actionHash)
    }
    if (resultMessage) {
      try {
        await this.respond(resultMessage)
      } catch (e) {
        console.warn("Error sending response", e)
        throw e
      }
    }
    /** return just the data like waitForMessage() */
    const data = getResultData(resultMessage)
    return data
  }

  async reject(input: string | string[]) {
    const actionHashes = isString(input) ? [input] : input
    return this.rejectAllActionHashes(actionHashes)
  }

  async rejectAll() {
    const actions = await this.queue.getAll()
    const actionHashes = actions.map((action) => action.meta.hash)
    return this.rejectAllActionHashes(actionHashes)
  }

  async rejectAllActionHashes(actionHashes: ActionHash[]) {
    for (const actionHash of actionHashes) {
      const action = await this.queue.remove(actionHash)
      if (!action) {
        throw new ActionError({ code: "NOT_FOUND" })
      }
      /**
       * Don't await handleActionRejection, this allows for existing patterns to use 'waitForMessage' after calling await clientActionService.reject(...)
       */
      handleActionRejection(action)
        .then((resultMessage) => {
          if (resultMessage) {
            void this.respond(resultMessage)
          }
        })
        .catch((e) => {
          /** handleActionRejection catches exceptions internally so this should never happen */
          throw e
        })
    }
  }

  async add<T extends ActionItem>(
    action: T,
    meta?: Partial<ActionQueueItemMeta>,
  ): Promise<ExtQueueItem<T>> {
    return this.queue.add(action, meta)
  }

  async remove(actionHash: string): Promise<ExtQueueItem<ActionItem> | null> {
    return this.queue.remove(actionHash)
  }
}
