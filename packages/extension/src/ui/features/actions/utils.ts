import { Call, CallData, RawArgs, num } from "starknet"
import { ActionQueueItem } from "../../../shared/actionQueue/schema"
import { TransactionActionPayload } from "../../../shared/actionQueue/types"
import { MultisigPendingTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import { ApproveScreenType } from "./transaction/types"
import { MultisigTransactionType } from "../../../shared/multisig/types"
import { TXV3_ACCOUNT_CLASS_HASH } from "../../../shared/network/constants"

export const getApproveScreenTypeFromAction = (
  action: ActionQueueItem & {
    type: "TRANSACTION"
    payload: TransactionActionPayload
  },
) => {
  switch (action.payload.meta?.type) {
    case MultisigTransactionType.MULTISIG_ADD_SIGNERS:
      return ApproveScreenType.MULTISIG_ADD_SIGNERS
    case MultisigTransactionType.MULTISIG_CHANGE_THRESHOLD:
      return ApproveScreenType.MULTISIG_UPDATE_THRESHOLD
    case MultisigTransactionType.MULTISIG_REMOVE_SIGNERS:
      return ApproveScreenType.MULTISIG_REMOVE_SIGNERS
    case MultisigTransactionType.MULTISIG_REPLACE_SIGNER:
      return ApproveScreenType.MULTISIG_REPLACE_SIGNER
    case "ADD_ARGENT_SHIELD":
      return ApproveScreenType.ADD_ARGENT_SHIELD
    case "REMOVE_ARGENT_SHIELD":
      return ApproveScreenType.REMOVE_ARGENT_SHIELD
    default:
      return ApproveScreenType.TRANSACTION
  }
}

export const getApproveScreenTypeFromPendingTransaction = (
  pendingTransaction: MultisigPendingTransaction,
) => {
  switch (pendingTransaction.type) {
    case MultisigTransactionType.MULTISIG_ADD_SIGNERS:
      return ApproveScreenType.MULTISIG_ADD_SIGNERS
    case MultisigTransactionType.MULTISIG_CHANGE_THRESHOLD:
      return ApproveScreenType.MULTISIG_UPDATE_THRESHOLD
    case MultisigTransactionType.MULTISIG_REMOVE_SIGNERS:
      return ApproveScreenType.MULTISIG_REMOVE_SIGNERS
    case MultisigTransactionType.MULTISIG_REPLACE_SIGNER:
      return ApproveScreenType.MULTISIG_REPLACE_SIGNER

    default:
      return ApproveScreenType.TRANSACTION
  }
}

/**
 * This is a temporary method to format calldata for the UI.
 * Floats are not supported by felt() in starknet.js
 * So we convert it to a string to unblock users
 * @param calldata
 * @returns
 */

export const formatCalldataSafe = (calldata?: RawArgs) => {
  return calldata && Array.isArray(calldata)
    ? calldata.map((cd) => cd.toString())
    : calldata
}

export function getV3UpgradeCall(calls: Call[]) {
  return calls
    .filter((call) => call.entrypoint === "upgrade")
    .find((call) =>
      CallData.toCalldata(call.calldata).some(
        (cd) => num.toBigInt(cd) === num.toBigInt(TXV3_ACCOUNT_CLASS_HASH),
      ),
    )
}
