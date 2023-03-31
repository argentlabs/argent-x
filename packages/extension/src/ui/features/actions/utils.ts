import {
  QueueItem,
  TransactionActionPayload,
} from "../../../shared/actionQueue/types"
import { MultisigPendingTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import { ApproveScreenType } from "./transaction/types"

export const getApproveScreenTypeFromAction = (
  action: QueueItem & {
    type: "TRANSACTION"
    payload: TransactionActionPayload
  },
) => {
  switch (action.payload.meta?.type) {
    case "MULTISIG_ADD_SIGNERS":
      return ApproveScreenType.MULTISIG_ADD_SIGNERS
    case "MULTISIG_UPDATE_THRESHOLD":
      return ApproveScreenType.MULTISIG_UPDATE_THRESHOLD
    case "MULTISIG_REMOVE_SIGNER":
      return ApproveScreenType.MULTISIG_REMOVE_SIGNER
    default:
      return ApproveScreenType.TRANSACTION
  }
}

export const getApproveScreenTypeFromPendingTransaction = (
  pendingTransaction: MultisigPendingTransaction,
) => {
  switch (pendingTransaction.type) {
    case "MULTISIG_ADD_SIGNERS":
      return ApproveScreenType.MULTISIG_ADD_SIGNERS
    case "MULTISIG_UPDATE_THRESHOLD":
      return ApproveScreenType.MULTISIG_UPDATE_THRESHOLD
    case "MULTISIG_REMOVE_SIGNER":
      return ApproveScreenType.MULTISIG_REMOVE_SIGNER

    default:
      return ApproveScreenType.TRANSACTION
  }
}
