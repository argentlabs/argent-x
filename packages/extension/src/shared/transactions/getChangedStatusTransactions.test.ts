import { describe, it, expect, Mocked } from "vitest"
import type { ExtendedTransactionStatus, Transaction } from "../transactions"
import { getChangedStatusTransactions } from "./getChangedStatusTransactions"

const getMockTransaction = (
  hash?: string,
  status?: ExtendedTransactionStatus,
) => {
  return {
    hash,
    status,
  } as Mocked<Transaction>
}

describe("getChangedStatusTransactions", () => {
  const transaction1 = getMockTransaction("0x1", {
    finality_status: "PENDING",
  })
  const transaction1reverted = getMockTransaction("0x1", {
    finality_status: "REJECTED",
    execution_status: "REVERTED",
  })
  const transaction2 = getMockTransaction("0x2", {
    finality_status: "ACCEPTED_ON_L1",
    execution_status: "SUCCEEDED",
  })
  const transaction3 = getMockTransaction("0x3", {
    finality_status: "PENDING",
  })
  const transaction3succeeded = getMockTransaction("0x3", {
    finality_status: "ACCEPTED_ON_L1",
    execution_status: "SUCCEEDED",
  })

  it("should return new transactions with changed status", () => {
    const changeSet = {
      oldValue: [transaction1, transaction2, transaction3],
      newValue: [transaction1reverted, transaction2, transaction3succeeded],
    }

    const result = getChangedStatusTransactions(changeSet)
    expect(result).toEqual([transaction1reverted, transaction3succeeded])
  })

  it("should not return new transactions with same status", () => {
    const result = getChangedStatusTransactions({
      oldValue: [transaction1, transaction2, transaction3],
      newValue: [transaction1, transaction2, transaction3],
    })
    expect(result).toEqual([])
  })

  it("should handle empty old value", () => {
    const changeSet = {
      oldValue: [],
      newValue: [transaction1, transaction2, transaction3],
    }
    const result = getChangedStatusTransactions(changeSet)
    expect(result).toEqual([])
  })

  it("should handle empty new value", () => {
    const changeSet = {
      oldValue: [transaction1, transaction2, transaction3],
      newValue: [],
    }
    const result = getChangedStatusTransactions(changeSet)
    expect(result).toEqual([])
  })
})
