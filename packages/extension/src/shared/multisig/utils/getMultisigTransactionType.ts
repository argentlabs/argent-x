import { isEqualAddress } from "@argent/x-shared"
import type { Call } from "starknet"
import { MultisigEntryPointType, MultisigTransactionType } from "../types"
import type {
  ApiMultisigRequest,
  ApiMultisigTransactionState,
} from "../multisig.model"

export const getMultisigTransactionType = (transactions: Call[]) => {
  const entryPoints = transactions.map((tx) => tx.entrypoint)
  switch (true) {
    case entryPoints.includes(MultisigEntryPointType.ADD_SIGNERS): {
      return MultisigTransactionType.MULTISIG_ADD_SIGNERS
    }
    case entryPoints.includes(MultisigEntryPointType.CHANGE_THRESHOLD): {
      return MultisigTransactionType.MULTISIG_CHANGE_THRESHOLD
    }
    case entryPoints.includes(MultisigEntryPointType.REMOVE_SIGNERS): {
      return MultisigTransactionType.MULTISIG_REMOVE_SIGNERS
    }
    case entryPoints.includes(MultisigEntryPointType.REPLACE_SIGNER): {
      return MultisigTransactionType.MULTISIG_REPLACE_SIGNER
    }
    default: {
      return undefined
    }
  }
}

export const isMultisigTransactionRejectedAndNonceNotConsumed = (
  transactionStatus?: ApiMultisigTransactionState,
) => {
  return transactionStatus === "REJECTED" || transactionStatus === "ERROR"
}

export const transactionNeedsRetry = (
  tx: ApiMultisigRequest,
  allRequests: ApiMultisigRequest[],
) => {
  const hasRetryStatus = isMultisigTransactionRejectedAndNonceNotConsumed(
    tx.state,
  )
  if (!hasRetryStatus) return false

  // tx needs retry if it was rejected or errored and it wasn't alreaty retried
  const hasBeenRetried = !allRequests.some(
    (request) =>
      isEqualAddress(request.multisigAddress, tx.multisigAddress) &&
      request.nonce === tx.nonce &&
      !isMultisigTransactionRejectedAndNonceNotConsumed(request.state),
  )

  // Find the request with the maximum nonce that has status completed
  const maxNonceCompletedRequest = allRequests
    .filter(
      (request) =>
        isEqualAddress(request.multisigAddress, tx.multisigAddress) &&
        (request.state === "TX_ACCEPTED_L2" || request.state === "COMPLETE"),
    )
    .reduce(
      (maxRequest, currentRequest) =>
        currentRequest.nonce > maxRequest.nonce ? currentRequest : maxRequest,
      { nonce: -1 } as ApiMultisigRequest,
    )

  const isSubsequentNonceConsumed = maxNonceCompletedRequest.nonce > tx.nonce

  return hasBeenRetried && !isSubsequentNonceConsumed
}
