import Emittery from "emittery"

/** TODO: refactor - emitter should belong to a multisig service or worker */

export const multisigEmitter = new Emittery<MultisigEmitterEvents>()

export const TransactionCreatedForMultisigPendingTransaction = Symbol(
  "TransactionCreatedForMultisigPendingTransaction",
)

export type MultisigEmitterEvents = {
  [TransactionCreatedForMultisigPendingTransaction]: {
    requestId: string
    transactionHash: string
  }
}
