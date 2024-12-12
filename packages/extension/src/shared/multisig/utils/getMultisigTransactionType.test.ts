import type { ApiMultisigRequest } from "../multisig.model"
import multisigRequests from "./fixtures/multisigRequests.json"
import multisigRequestsWithRejectedTx from "./fixtures/multisigRequestsWithRejected.json"
import multisigRequestsWithRetriedTx from "./fixtures/multisigRequestsWithRetried.json"
import {
  isMultisigTransactionRejectedAndNonceNotConsumed,
  transactionNeedsRetry,
} from "./getMultisigTransactionType"

describe("transactionNeedsRetry", () => {
  it("should return false for valid transaction in a list with no rejected transactions", () => {
    const tx = multisigRequests[0] as ApiMultisigRequest
    expect(isMultisigTransactionRejectedAndNonceNotConsumed(tx.state)).toBe(
      false,
    )
    const needsRetry = transactionNeedsRetry(
      tx,
      multisigRequests as ApiMultisigRequest[],
    )
    expect(needsRetry).toBe(false)
  })

  it("should return false for valid transaction in a list with rejected transactions", () => {
    const tx = multisigRequests[0] as ApiMultisigRequest
    expect(isMultisigTransactionRejectedAndNonceNotConsumed(tx.state)).toBe(
      false,
    )
    const needsRetry = transactionNeedsRetry(
      tx,
      multisigRequestsWithRejectedTx as ApiMultisigRequest[],
    )
    expect(needsRetry).toBe(false)
  })

  it("should return true for rejected transaction that was not retried", () => {
    const tx = multisigRequestsWithRejectedTx[3] as ApiMultisigRequest
    expect(isMultisigTransactionRejectedAndNonceNotConsumed(tx.state)).toBe(
      true,
    )
    const needsRetry = transactionNeedsRetry(tx, [
      ...multisigRequestsWithRejectedTx,
      ...multisigRequests,
    ] as ApiMultisigRequest[])
    expect(needsRetry).toBe(true)
  })

  it("should return false for rejected transaction that was retried", () => {
    const tx = multisigRequestsWithRetriedTx[1] as ApiMultisigRequest
    expect(isMultisigTransactionRejectedAndNonceNotConsumed(tx.state)).toBe(
      true,
    )
    const needsRetry = transactionNeedsRetry(tx, [
      ...multisigRequestsWithRetriedTx,
      ...multisigRequests,
    ] as ApiMultisigRequest[])
    expect(needsRetry).toBe(false)
  })

  it("should return false for rejected transaction with subsequent completed transactions", () => {
    const tx = multisigRequests[4] as ApiMultisigRequest
    expect(isMultisigTransactionRejectedAndNonceNotConsumed(tx.state)).toBe(
      true,
    )
    const needsRetry = transactionNeedsRetry(tx, [
      ...multisigRequests,
    ] as ApiMultisigRequest[])
    expect(needsRetry).toBe(false)
  })
})
