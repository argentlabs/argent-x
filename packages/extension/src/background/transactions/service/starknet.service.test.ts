import { describe, vi } from "vitest"
import { TransactionTrackerWorker } from "./starknet.service"
import { mockChainService } from "../../../shared/chain/service/__test__/mock"
import { MockFnRepository } from "../../../shared/storage/__new/__test__/mockFunctionImplementation"
import { Transaction } from "../../../shared/transactions"
import { createScheduleServiceMock } from "../../../shared/schedule/mock"
import { IScheduleService } from "../../../shared/schedule/interface"
import { IBackgroundUIService } from "../../__new/services/ui/interface"
import { IDebounceService } from "../../../shared/debounce"
import { emitterMock } from "../../wallet/test.utils"
import { getMockDebounceService } from "../../../shared/debounce/mock"

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
    }
    mockDebounceService = getMockDebounceService()

    transactionsRepo = new MockFnRepository()
    transactionTracker = new TransactionTrackerWorker(
      mockScheduleService,
      mockChainService,
      transactionsRepo,
      mockBackgroundUIService,
      mockDebounceService,
    )
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
})
