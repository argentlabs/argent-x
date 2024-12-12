import { isObject, isString } from "lodash-es"

import type { IActionQueue } from "../../../shared/actionQueue/queue/IActionQueue"
import type {
  ActionHash,
  ActionItemExtra,
  ActionQueueItemMeta,
} from "../../../shared/actionQueue/schema"
import type {
  ActionItem,
  ExtensionActionItem,
  ExtQueueItem,
} from "../../../shared/actionQueue/types"
import type { MessageType } from "../../../shared/messages"
import {
  handleActionApproval,
  handleActionRejection,
} from "../../actionHandlers"
import type { Respond, RespondToHost } from "../../respond"
import type { Wallet } from "../../wallet"
import {
  TransactionCreatedForAction,
  type Events,
  type IBackgroundActionService,
} from "./IBackgroundActionService"
import { ActionError } from "../../../shared/errors/action"
import type { SimulateAndReview } from "@argent/x-shared/simulation"
import type Emittery from "emittery"
import type { MultisigPendingTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import type { ArrayStorage } from "../../../shared/storage"
import type { ApproveActionInput } from "../../../shared/actionQueue/service/IActionService"

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
    readonly emitter: Emittery<Events>,
    private queue: IActionQueue<ActionItem>,
    private multisigPendingTransactionsStore: ArrayStorage<MultisigPendingTransaction>,
    private wallet: Wallet,
    private respond: Respond,
    private respondToHost: RespondToHost,
  ) {}

  async approve({
    actionHash: input,
    extra,
  }: {
    actionHash: ActionHash | ExtensionActionItem
    extra?: ActionItemExtra
  }) {
    const actionHash = isString(input) ? input : input.meta.hash
    const action = await this.queue.get(actionHash)
    if (!action) {
      throw new ActionError({ code: "NOT_FOUND" })
    }
    await this.queue.updateMeta(actionHash, {
      startedApproving: Date.now(),
      errorApproving: undefined,
    })
    /**
     * Don't await handleActionApproval, this allows for existing patterns to use 'waitForMessage' after calling await clientActionService.approve(...)
     */
    handleActionApproval(action, this.wallet, extra)
      .then(async (resultMessage) => {
        const error = getResultDataError(resultMessage)
        if (error) {
          await this.queue.updateMeta(actionHash, {
            startedApproving: undefined,
            errorApproving: error,
          })
        } else {
          await this.maybeEmitTransactionCreatedForAction({
            actionHash,
            resultMessage,
          })
          await this.queue.remove(actionHash)
        }
        if (resultMessage) {
          if ("host" in action.payload) {
            void this.respondToHost(resultMessage, action.payload.host)
          } else {
            void this.respond(resultMessage)
          }
        }
      })
      .catch((e) => {
        /** handleActionApproval catches exceptions internally so this should never happen */
        throw e
      })
  }

  async approveAndWait({ actionHash, extra }: ApproveActionInput) {
    const action = await this.queue.get(actionHash)
    if (!action) {
      throw new ActionError({ code: "NOT_FOUND" })
    }
    await this.queue.updateMeta(actionHash, {
      startedApproving: Date.now(),
      errorApproving: undefined,
    })
    const resultMessage = await handleActionApproval(action, this.wallet, extra)

    const error = getResultDataError(resultMessage)
    if (error) {
      await this.queue.updateMeta(actionHash, {
        startedApproving: undefined,
        errorApproving: error,
      })
    } else {
      await this.maybeEmitTransactionCreatedForAction({
        actionHash,
        resultMessage,
      })
      await this.queue.remove(actionHash)
    }
    if (resultMessage) {
      try {
        if ("host" in action.payload) {
          await this.respondToHost(resultMessage, action.payload.host)
        } else {
          await this.respond(resultMessage)
        }
      } catch (e) {
        console.warn("Error sending response", e)
        throw e
      }
    }
    /** return just the data like waitForMessage() */
    const data = getResultData(resultMessage)
    return data
  }

  async maybeEmitTransactionCreatedForAction({
    actionHash,
    resultMessage,
  }: {
    actionHash: ActionHash
    resultMessage?: MessageType
  }) {
    if (!resultMessage) {
      return
    }
    if (resultMessage.type === "TRANSACTION_SUBMITTED") {
      await this.emitter.emit(TransactionCreatedForAction, {
        actionHash,
        transactionHash: resultMessage.data.txHash,
      })
    }
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
        continue
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

  async addFront<T extends ActionItem>(
    action: T,
    meta?: Partial<ActionQueueItemMeta>,
  ): Promise<ExtQueueItem<T>> {
    return this.queue.addFront(action, meta)
  }

  async remove(actionHash: string): Promise<ExtQueueItem<ActionItem> | null> {
    return this.queue.remove(actionHash)
  }

  async updateTransactionReview({
    actionHash,
    transactionReview,
  }: {
    actionHash: ActionHash
    transactionReview: SimulateAndReview
  }) {
    const action = await this.queue.get(actionHash)
    if (action) {
      await this.queue.updateMeta(actionHash, {
        transactionReview,
      })
    }

    /**
     * FIXME: at present, Pending multisig tx from backend will not have any tx review,
     * so add that to the meta too, so it can be used when creating the NativeActivity
     */
    const [multisigPendingTransaction] =
      await this.multisigPendingTransactionsStore.get(
        (transaction) => transaction.requestId === actionHash,
      )
    if (multisigPendingTransaction) {
      await this.multisigPendingTransactionsStore.push([
        {
          ...multisigPendingTransaction,
          meta: {
            ...multisigPendingTransaction.meta,
            transactionReview,
          },
        },
      ])
    }

    if (!action && !multisigPendingTransaction) {
      throw new ActionError({ code: "NOT_FOUND" })
    }
  }

  async clearActionError(actionHash: ActionHash) {
    await this.queue.updateMeta(actionHash, {
      errorApproving: undefined,
    })
  }
}
