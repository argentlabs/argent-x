import { afterEach, describe, vi } from "vitest"
import {
  TransactionStatusChanged,
  TransactionTrackerWorker,
} from "./TransactionTrackerWorker"
import { mockChainService } from "../../../../shared/chain/service/__test__/mock"
import { MockFnRepository } from "../../../../shared/storage/__new/__test__/mockFunctionImplementation"
import type {
  ExecutionStatus,
  ExtendedFinalityStatus,
  Transaction,
} from "../../../../shared/transactions"
import { createScheduleServiceMock } from "../../../../shared/schedule/mock"
import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { IBackgroundUIService } from "../../ui/IBackgroundUIService"
import type { IDebounceService } from "../../../../shared/debounce"
import { getMockDebounceService } from "../../../../shared/debounce/mock"
import { delay } from "../../../../shared/utils/delay"
import { getTransactionStatus } from "../../../../shared/transactions/utils"
import { emitterMock } from "../../../../shared/test.utils"

vi.mock("../../../../shared/utils/delay")
vi.mock("../../../../shared/transactions/utils")

describe("TransactionTrackerWorker", () => {
  let transactionsRepo: MockFnRepository<Transaction>
  let transactionTracker: TransactionTrackerWorker
  let mockScheduleService: IScheduleService
  let mockBackgroundUIService: IBackgroundUIService
  let mockDebounceService: IDebounceService

  beforeEach(() => {
    const [, _mockScheduleService] = createScheduleServiceMock()
    mockScheduleService = _mockScheduleService

    mockBackgroundUIService = {
      opened: true,
      emitter: emitterMock,
      openUiAndUnlock: vi.fn(),
      hasPopup: vi.fn(),
      closePopup: vi.fn(),
      openUi: vi.fn(),
      showNotification: vi.fn(),
      openUiAsFloatingWindow: vi.fn(),
    }
    mockDebounceService = getMockDebounceService()

    transactionsRepo = new MockFnRepository()
    transactionTracker = new TransactionTrackerWorker(
      mockScheduleService,
      mockChainService,
      transactionsRepo,
      mockBackgroundUIService,
      mockDebounceService,
      emitterMock,
    )

    vi.mocked(getTransactionStatus).mockReturnValue({
      finality_status: "RECEIVED",
    })
  })

  const getMockTransaction = (
    finality_status: string,
    execution_status: string,
  ) => {
    return {
      hash: "0x01",
      meta: {
        isMaxSend: false,
        title: "Transfer",
        transactions: {
          calldata: [
            "102948199182882721567420365830557897298787755780269406003718127961150842515",
            "100000000000",
            "0",
          ],
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "transfer",
        },
        type: "INVOKE",
      },
      status: {
        execution_status: execution_status,
        finality_status: finality_status,
      },
      timestamp: Math.floor(Date.now() / 1000),
    } as Transaction
  }

  afterEach(() => {
    vi.resetAllMocks()
    emitterMock.emit.mockClear()
  })

  describe("getStaleTransactions", () => {
    describe("when is has a completed status", () => {
      describe("and is fresh", () => {
        it.each([
          { finality_status: "RECEIVED", execution_status: "SUCCEEDED" },
          { finality_status: "REJECTED", execution_status: "SUCCEEDED" },
          { finality_status: "ACCEPTED_ON_L2", execution_status: "SUCCEEDED" },
          { finality_status: "ACCEPTED_ON_L2", execution_status: "REVERTED" },
          { finality_status: "ACCEPTED_ON_L1", execution_status: "SUCCEEDED" },
        ])(
          "should return false",
          async ({ finality_status, execution_status }) => {
            const transaction = getMockTransaction(
              finality_status,
              execution_status,
            )
            const isStale = transactionTracker.getStaleTransactions(
              transaction,
              Math.floor(Date.now() / 1000),
            )
            expect(isStale).toBe(false)
          },
        )
      })
      describe("and is stale", () => {
        it.each([
          { finality_status: "REJECTED", execution_status: "SUCCEEDED" },
          { finality_status: "ACCEPTED_ON_L2", execution_status: "SUCCEEDED" },
          { finality_status: "ACCEPTED_ON_L2", execution_status: "REVERTED" },
          { finality_status: "ACCEPTED_ON_L1", execution_status: "SUCCEEDED" },
        ])(
          "should return true",
          async ({ finality_status, execution_status }) => {
            const transaction = {
              ...getMockTransaction(finality_status, execution_status),
              timestamp: Math.floor((Date.now() - 1000 * 120) / 1000),
            } as Transaction
            vi.mocked(getTransactionStatus).mockReturnValue({
              finality_status,
              execution_status,
            } as {
              finality_status: ExtendedFinalityStatus
              execution_status: ExecutionStatus
            })
            const isStale = transactionTracker.getStaleTransactions(
              transaction,
              Math.floor(Date.now() / 1000),
            )
            expect(isStale).toBe(true)
          },
        )
      })
    })
    describe("when it has an incomplete status", () => {
      describe("and is fresh", () => {
        it("should return false", async () => {
          const transaction = getMockTransaction("RECEIVED", "SUCCEEDED")

          const isStale = transactionTracker.getStaleTransactions(
            transaction,
            Math.floor(Date.now() / 1000),
          )
          expect(isStale).toBe(false)
        })
      })
      describe("and is stale", () => {
        it("should return true", async () => {
          const transaction = {
            ...getMockTransaction("RECEIVED", "SUCCEEDED"),

            timestamp: Math.floor((Date.now() - 1000 * 120) / 1000),
          } as Transaction
          const isStale = transactionTracker.getStaleTransactions(
            transaction,
            Math.floor(Date.now() / 1000),
          )
          expect(isStale).toBe(false)
        })
      })
    })
  })

  describe("cleanupTransactionStore", () => {
    describe("when there are no transactions", () => {
      it("does nothing", async () => {
        transactionsRepo.get.mockResolvedValue([])
        await transactionTracker.cleanupTransactionStore()
        expect(transactionsRepo.remove).toHaveBeenCalledWith([])
      })
    })
    describe("when there are stale transactions", () => {
      it("does remove them", async () => {
        const mockTransaction = getMockTransaction("RECEIVED", "SUCCEEDED")
        transactionsRepo.get.mockResolvedValue([mockTransaction])
        await transactionTracker.cleanupTransactionStore()
        expect(transactionsRepo.remove).toHaveBeenCalledWith([mockTransaction])
      })
    })
  })

  describe("subscribeToRepoChange", () => {
    it("should subscribe to transactionsRepo changes", () => {
      transactionTracker.subscribeToRepoChange()
      expect(transactionsRepo.subscribe).toHaveBeenCalled()
    })

    it("should not trigger sync for empty changeset", async () => {
      transactionTracker.syncTransactionRepo = vi.fn()

      transactionTracker.subscribeToRepoChange()

      const callback = transactionsRepo.subscribe.mock.calls[0][0]
      await callback({ oldValue: [], newValue: [] })

      expect(transactionTracker.syncTransactionRepo).not.toHaveBeenCalled()
      expect(delay).not.toHaveBeenCalled()
    })

    it("should trigger sync for new RECEIVED transactions", async () => {
      transactionTracker.syncTransactionRepo = vi.fn().mockResolvedValue([])

      transactionTracker.subscribeToRepoChange()

      const callback = transactionsRepo.subscribe.mock.calls[0][0]
      await callback({
        oldValue: [],
        newValue: [{ hash: "0x123" }],
      })

      expect(transactionTracker.syncTransactionRepo).toHaveBeenCalled()
      expect(delay).toHaveBeenCalledWith(1000) // First delay
    })

    it("should not trigger sync for non-RECEIVED transactions", async () => {
      vi.mocked(getTransactionStatus).mockReturnValue({
        finality_status: "ACCEPTED_ON_L2",
      })
      transactionTracker.syncTransactionRepo = vi.fn()

      transactionTracker.subscribeToRepoChange()

      const callback = transactionsRepo.subscribe.mock.calls[0][0]
      await callback({
        oldValue: [],
        newValue: [{ hash: "0x123" }],
      })

      expect(transactionTracker.syncTransactionRepo).not.toHaveBeenCalled()
      expect(delay).not.toHaveBeenCalled()
    })

    it("should stop syncing when no in-flight transactions are found", async () => {
      transactionTracker.syncTransactionRepo = vi.fn().mockResolvedValue([])

      transactionTracker.subscribeToRepoChange()

      const callback = transactionsRepo.subscribe.mock.calls[0][0]

      // Use Promise.resolve().then() to ensure the callback is called in the next event loop
      await Promise.resolve().then(() =>
        callback({
          oldValue: [],
          newValue: [{ hash: "0x123" }],
        }),
      )

      // Wait for all promises in the microtask queue to resolve
      await new Promise(process.nextTick)

      expect(transactionTracker.syncTransactionRepo).toHaveBeenCalledTimes(1)
      expect(delay).toHaveBeenCalledTimes(1)

      expect(transactionTracker.emitter.emit).toHaveBeenCalledWith(
        TransactionStatusChanged,
        {
          transactions: ["0x123"],
        },
      )
    })

    it("should continue syncing for the specified delays when in-flight transactions exist", async () => {
      transactionTracker.syncTransactionRepo = vi
        .fn()
        .mockResolvedValue(["tx1"])

      transactionTracker.subscribeToRepoChange()

      const callback = transactionsRepo.subscribe.mock.calls[0][0]
      await callback({
        oldValue: [],
        newValue: [{ hash: "0x123" }],
      })

      // Wait for all promises in the microtask queue to resolve
      await new Promise(process.nextTick)

      expect(transactionTracker.syncTransactionRepo).toHaveBeenCalledTimes(10) // Once for each delay
      expect(delay).toHaveBeenCalledTimes(10)
      expect(transactionTracker.emitter.emit).not.toHaveBeenCalled()
    })

    it("should continue syncing for the specified delays and break when in-flight transactions don't exist anymore", async () => {
      transactionTracker.syncTransactionRepo = vi
        .fn()
        .mockResolvedValueOnce(["tx1"])
        .mockResolvedValueOnce(["tx1"])
        .mockResolvedValue([])

      transactionTracker.subscribeToRepoChange()

      const callback = transactionsRepo.subscribe.mock.calls[0][0]
      await callback({
        oldValue: [],
        newValue: [{ hash: "0x123" }],
      })

      // Wait for all promises in the microtask queue to resolve
      await new Promise(process.nextTick)

      expect(transactionTracker.syncTransactionRepo).toHaveBeenCalledTimes(3) // Once for each delay
      expect(delay).toHaveBeenCalledTimes(3)
      expect(transactionTracker.emitter.emit).toHaveBeenCalledWith(
        TransactionStatusChanged,
        {
          transactions: ["0x123"],
        },
      )
    })

    it("should handle errors during sync process", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      const syncError = new Error("Sync error")

      transactionTracker.syncTransactionRepo = vi
        .fn()
        .mockRejectedValueOnce(syncError)

      transactionTracker.subscribeToRepoChange()

      const callback = transactionsRepo.subscribe.mock.calls[0][0]

      await callback({
        oldValue: [],
        newValue: [{ hash: "0x123" }],
      })

      // Wait for all promises in the microtask queue to resolve
      await new Promise(process.nextTick)

      expect(transactionTracker.syncTransactionRepo).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})
