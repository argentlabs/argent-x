import { describe, expect, test, vi } from "vitest"

import { INetworkService } from "../../network/service/INetworkService"
import { Network } from "../../network"
import { StarknetChainService } from "./StarknetChainService"
import { Hex } from "@argent/x-shared"

const mocks = vi.hoisted(() => {
  return {
    getProvider: vi.fn(),
  }
})

vi.mock("../../network", () => {
  return {
    getProvider: mocks.getProvider,
  }
})

describe("StarknetChainService", () => {
  const makeService = () => {
    const networkService: Pick<INetworkService, "getById"> = {
      // return a falsy value if network is not known. This is normally not allowed, but will skip the account discovery on the known networks (sepolia and mainnet)
      getById: async () => {
        return {
          id: "sepolia-alpha",
          chainId: "SN_SEPOLIA",
          rpcUrl: "http://127.0.0.1:5050/",
          name: "Test Network",
        } as Network
      },
    }

    return new StarknetChainService(networkService)
  }
  test.each(["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"])(
    "should return correct status, given %s successful tx",
    async (status) => {
      const starknetChainService = makeService()

      const mockTransaction = {
        hash: "0x123" as Hex,
        networkId: "sepolia-alpha",
        status: {
          finality_status: "RECEIVED",
        },
      }

      const getTransactionReceipt = vi.fn()

      vi.mocked(mocks).getProvider.mockReturnValue({
        getTransactionStatus: () => ({
          finality_status: status,
        }),
        getTransactionReceipt: () => ({
          finality_status: status,
          isSuccess: () => true,
        }),
      })

      const txWithStatus =
        await starknetChainService.getTransactionStatus(mockTransaction)

      expect(txWithStatus.status.status).toEqual("confirmed")
      expect(getTransactionReceipt).not.toHaveBeenCalled()
    },
  )

  test("should return correct status, given rejected tx", async () => {
    const starknetChainService = makeService()

    const mockTransaction = {
      hash: "0x123" as Hex,
      networkId: "sepolia-alpha",
      status: {
        finality_status: "RECEIVED",
      },
    }

    const getTransactionReceipt = vi.fn()

    vi.mocked(mocks).getProvider.mockReturnValue({
      getTransactionStatus: () => ({
        finality_status: "REJECTED",
      }),
      getTransactionReceipt,
    })

    const txWithStatus =
      await starknetChainService.getTransactionStatus(mockTransaction)

    expect(txWithStatus.status.status).toEqual("failed")
    expect(getTransactionReceipt).not.toHaveBeenCalled()
  })

  test("should return correct status and reason, given reverted tx", async () => {
    const starknetChainService = makeService()

    const mockTransaction = {
      hash: "0x123" as Hex,
      networkId: "sepolia-alpha",
      status: {
        finality_status: "RECEIVED",
      },
    }

    const getTransactionReceipt = vi.fn().mockResolvedValue({
      revert_reason: "foo",
      isReverted: () => true,
    })

    vi.mocked(mocks).getProvider.mockReturnValue({
      getTransactionStatus: () => ({
        execution_status: "REVERTED",
      }),
      getTransactionReceipt,
    })

    const txWithStatus =
      await starknetChainService.getTransactionStatus(mockTransaction)

    expect(txWithStatus.status.status).toEqual("failed")
    expect(getTransactionReceipt).toHaveBeenCalledWith(mockTransaction.hash)
  })

  test("should return correct status and reason, given failed receipt call", async () => {
    const starknetChainService = makeService()

    const mockTransaction = {
      hash: "0x123" as Hex,
      networkId: "sepolia-alpha",
      status: {
        finality_status: "RECEIVED",
      },
    }

    const getTransactionReceipt = vi.fn().mockRejectedValue({})

    vi.mocked(mocks).getProvider.mockReturnValue({
      getTransactionStatus: () => ({
        execution_status: "REVERTED",
      }),
      getTransactionReceipt,
    })

    const txWithStatus =
      await starknetChainService.getTransactionStatus(mockTransaction)

    expect(txWithStatus.status.status).toEqual("failed")
    expect(getTransactionReceipt).toHaveBeenCalledWith(mockTransaction.hash)
  })
})
