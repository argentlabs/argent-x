import Emittery from "emittery"
import { actionQueue } from "../../../shared/actionQueue"
import { respond, respondToHost } from "../../respond"
import { walletSingleton } from "../../walletSingleton"
import BackgroundActionService from "./BackgroundActionService"
import type { Events } from "./IBackgroundActionService"
import { multisigPendingTransactionsStore } from "../../../shared/multisig/pendingTransactionsStore"

const emitter = new Emittery<Events>()

export const backgroundActionService = new BackgroundActionService(
  emitter,
  actionQueue,
  multisigPendingTransactionsStore,
  walletSingleton,
  respond,
  respondToHost,
)
