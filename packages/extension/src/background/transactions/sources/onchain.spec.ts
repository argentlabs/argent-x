import { describe, expect, test, vi } from "vitest"

import { Hex } from "@argent/shared"
import { getTransactionsUpdate } from "./onchain"
import { WalletAccount } from "../../../shared/wallet.model"
import { ExtendedFinalityStatus } from "../../../shared/transactions"

const mocks = vi.hoisted(() => {
  return {
    getProvider: vi.fn(),
  }
})

vi.mock("../../../shared/network", () => {
  return {
    getProvider: mocks.getProvider,
  }
})

describe("getTransactionsUpdate", () => {
  test.each(["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"])(
    "should return correct status, given %s successful tx",
    async (status) => {
      const mockTransaction = {
        hash: "0x123" as Hex,
        networkId: "goerli-alpha",
        status: { finality_status: "RECEIVED" as ExtendedFinalityStatus },
        timestamp: 123,
        account: { address: "0x1", networkId: "goerli-alpha" } as WalletAccount,
      }

      const getTransactionReceipt = vi.fn()

      vi.mocked(mocks).getProvider.mockReturnValue({
        getTransactionStatus: () => ({
          finality_status: status,
        }),
        getTransactionReceipt,
      })

      const test = await getTransactionsUpdate([mockTransaction])

      expect(test.length).toBe(1)
      expect(test[0].hash).toBe(mockTransaction.hash)
      expect(test[0].status.finality_status).toBe(status)
      expect(getTransactionReceipt).not.toHaveBeenCalled()
    },
  )

  test("should return correct status, given rejected tx", async () => {
    const mockTransaction = {
      hash: "0x123" as Hex,
      networkId: "goerli-alpha",
      status: {
        finality_status: "RECEIVED" as ExtendedFinalityStatus,
      },
      timestamp: 123,
      account: { address: "0x1", networkId: "goerli-alpha" } as WalletAccount,
    }

    const getTransactionReceipt = vi.fn()

    vi.mocked(mocks).getProvider.mockReturnValue({
      getTransactionStatus: () => ({
        finality_status: "REJECTED",
      }),
      getTransactionReceipt,
    })

    const test = await getTransactionsUpdate([mockTransaction])

    expect(test.length).toBe(1)
    expect(test[0].hash).toBe(mockTransaction.hash)
    expect(test[0].status.finality_status).toBe("REJECTED")
    expect(getTransactionReceipt).not.toHaveBeenCalled()
  })

  test("should return correct status, given reverted tx", async () => {
    const mockTransaction = {
      hash: "0x123" as Hex,
      networkId: "goerli-alpha",
      status: {
        finality_status: "RECEIVED" as ExtendedFinalityStatus,
      },
      timestamp: 123,
      account: { address: "0x1", networkId: "goerli-alpha" } as WalletAccount,
    }

    const getTransactionReceipt = vi
      .fn()
      .mockResolvedValue({ revert_reason: "foo" })

    vi.mocked(mocks).getProvider.mockReturnValue({
      getTransactionStatus: () => ({
        execution_status: "REVERTED",
        finality_status: "RECEIVED",
      }),
      getTransactionReceipt,
    })

    const test = await getTransactionsUpdate([mockTransaction])

    expect(test.length).toBe(1)
    expect(test[0].hash).toBe(mockTransaction.hash)
    expect(test[0].status.execution_status).toBe("REVERTED")
    expect(test[0].revertReason).toBe("foo")
    expect(getTransactionReceipt).toHaveBeenCalledWith(mockTransaction.hash)
  })

  test("should return correct status, given failing receipt call", async () => {
    const mockTransaction = {
      hash: "0x123" as Hex,
      networkId: "goerli-alpha",
      status: {
        finality_status: "RECEIVED" as ExtendedFinalityStatus,
      },
      timestamp: 123,
      account: { address: "0x1", networkId: "goerli-alpha" } as WalletAccount,
    }

    const getTransactionReceipt = vi.fn().mockRejectedValue({ error: "foo" })

    vi.mocked(mocks).getProvider.mockReturnValue({
      getTransactionStatus: () => ({
        execution_status: "REVERTED",
        finality_status: "RECEIVED",
      }),
      getTransactionReceipt,
    })

    const test = await getTransactionsUpdate([mockTransaction])

    expect(test.length).toBe(1)
    expect(test[0].hash).toBe(mockTransaction.hash)
    expect(test[0].status.execution_status).toBe("REVERTED")
    expect(getTransactionReceipt).toHaveBeenCalledWith(mockTransaction.hash)
  })
})
