import {
  getTransactionIdentifier,
  getTransactionStatus,
  identifierToBaseTransaction,
} from "./utils"
import { ExecutionStatus, ExtendedFinalityStatus } from "../transactions"
import { WalletAccount } from "../wallet.model"
import { describe, test, expect } from "vitest"

describe("Make sure encode and decode to identifier return to the same value", () => {
  test("encode and decode", () => {
    const transaction = {
      hash: "0x01" as const,
      networkId: "net1",
    }
    const identifier = getTransactionIdentifier(transaction)
    expect(identifier).toEqual("net1::0x01")
    const decoded = identifierToBaseTransaction(identifier)
    expect(decoded).toEqual(transaction)
  })
  test("encode and decode with non-byte values", () => {
    const transaction = {
      hash: "0x1" as const,
      networkId: "net1",
    }
    const parsedTransaction = {
      hash: "0x01" as const,
      networkId: "net1",
    }
    const identifier = getTransactionIdentifier(transaction)
    expect(identifier).toEqual("net1::0x01")
    const decoded = identifierToBaseTransaction(identifier)
    expect(decoded).toEqual(parsedTransaction)
  })
})

describe("getTransactionStatus", () => {
  test("should return correct finality_status, given new transaction schema", () => {
    const transaction = {
      hash: "0x01" as const,
      networkId: "net1",
      timestamp: 0,
      status: {
        finality_status: "ACCEPTED_ON_L2" as ExtendedFinalityStatus,
      },
      account: {
        networkId: "net1",
        address: "0x1",
      } as WalletAccount,
    }

    const { finality_status, execution_status } =
      getTransactionStatus(transaction)
    expect(finality_status).toEqual("ACCEPTED_ON_L2")
    expect(execution_status).toEqual(undefined)
  })
  test("should return correct finality_status, given old transaction schema", () => {
    const transaction = {
      hash: "0x01" as const,
      networkId: "net1",
      timestamp: 0,
      finalityStatus: "ACCEPTED_ON_L2",
      account: {
        networkId: "net1",
        address: "0x1",
      } as WalletAccount,
    }

    const { finality_status, execution_status } = getTransactionStatus(
      transaction as any,
    )
    expect(finality_status).toEqual("ACCEPTED_ON_L2")
    expect(execution_status).toEqual(undefined)
  })
  test("should return correct execution_status, given new transaction schema", () => {
    const transaction = {
      hash: "0x01" as const,
      networkId: "net1",
      timestamp: 0,
      status: {
        finality_status: "RECEIVED" as ExtendedFinalityStatus,
        execution_status: "REVERTED" as ExecutionStatus,
      },
      account: {
        networkId: "net1",
        address: "0x1",
      } as WalletAccount,
    }

    const { finality_status, execution_status } =
      getTransactionStatus(transaction)
    expect(finality_status).toEqual("RECEIVED")
    expect(execution_status).toEqual("REVERTED")
  })
  test("should return correct execution_status, given old transaction schema", () => {
    const transaction = {
      hash: "0x01" as const,
      networkId: "net1",
      timestamp: 0,
      finalityStatus: "RECEIVED",
      executionStatus: "REVERTED",
      account: {
        networkId: "net1",
        address: "0x1",
      } as WalletAccount,
    }

    const { finality_status, execution_status } = getTransactionStatus(
      transaction as any,
    )
    expect(finality_status).toEqual("RECEIVED")
    expect(execution_status).toEqual("REVERTED")
  })
  test("should return correct undefined, given no status info", () => {
    const transaction = {
      hash: "0x01" as const,
      networkId: "net1",
      timestamp: 0,
      account: {
        networkId: "net1",
        address: "0x1",
      } as WalletAccount,
    }

    const { finality_status, execution_status } = getTransactionStatus(
      transaction as any,
    )
    expect(finality_status).toEqual(undefined)
    expect(execution_status).toEqual(undefined)
  })
  test("should return undefined, given undefined", () => {
    const { finality_status, execution_status } =
      getTransactionStatus(undefined)
    expect(finality_status).toEqual(undefined)
    expect(execution_status).toEqual(undefined)
  })
})
