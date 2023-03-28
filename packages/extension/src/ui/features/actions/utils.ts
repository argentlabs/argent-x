import {
  QueueItem,
  TransactionActionPayload,
} from "../../../shared/actionQueue/types"
import { ApproveScreenType } from "./transaction/types"

export const getApproveScreenType = (
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
    default:
      return ApproveScreenType.TRANSACTION
  }
}
