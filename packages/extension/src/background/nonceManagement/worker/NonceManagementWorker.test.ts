import { vi } from "vitest"
import { NonceManagementWorker } from "./NonceManagementWorker"
import type {
  IRepository,
  StorageChange,
} from "../../../shared/storage/__new/interface"
import type { INonceManagementService } from "../INonceManagementService"
import type { Transaction } from "../../../shared/transactions"
import type { AccountId } from "../../../shared/wallet.model"
import { getChangedStatusTransactions } from "../../../shared/transactions/getChangedStatusTransactions"
import { getTransactionStatus } from "../../../shared/transactions/utils"
import { getMockAccount } from "../../../../test/account.mock"

vi.mock("../../../shared/transactions/getChangedStatusTransactions", () => ({
  getChangedStatusTransactions: vi.fn(),
}))

vi.mock("../../../shared/transactions/utils", () => ({
  getTransactionStatus: vi.fn(),
}))

describe("NonceManagementWorker", () => {
  let transactionsRepo: IRepository<Transaction>
  let nonceManagementService: INonceManagementService
  let worker: NonceManagementWorker

  beforeEach(() => {
    transactionsRepo = {
      subscribe: vi.fn(),
    } as unknown as IRepository<Transaction>
    nonceManagementService = {
      resetLocalNonce: vi.fn(),
    } as unknown as INonceManagementService
    worker = new NonceManagementWorker(transactionsRepo, nonceManagementService)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("refreshLocalNonce", () => {
    it("should call resetLocalNonce with the provided accountId", async () => {
      const accountId: AccountId = "test-account"
      const resetLocalNonceSpy = vi.spyOn(
        nonceManagementService,
        "resetLocalNonce",
      )

      await worker.refreshLocalNonce(accountId)

      expect(resetLocalNonceSpy).toHaveBeenCalledWith(accountId)
    })
  })

  describe("onTransactionRepoChange", () => {
    it("should not call onRejectedTransaction if there are no changed status transactions", () => {
      const getChangedStatusTransactionsMock = vi.mocked(
        getChangedStatusTransactions,
      )
      getChangedStatusTransactionsMock.mockReturnValue([])

      const onRejectedTransactionSpy = vi.spyOn(worker, "onRejectedTransaction")
      const changeSet: StorageChange<Transaction[]> = {
        newValue: [],
        oldValue: [],
      }

      worker.onTransactionRepoChange(changeSet)

      expect(onRejectedTransactionSpy).not.toHaveBeenCalled()
    })

    it("should call onRejectedTransaction for rejected transactions", () => {
      const rejectedTransaction = {
        account: getMockAccount(),
      } as any
      const changedStatusTransactions = [rejectedTransaction]
      const getChangedStatusTransactionsMock = vi.mocked(
        getChangedStatusTransactions,
      )
      const getTransactionStatusMock = vi.mocked(getTransactionStatus)
      getChangedStatusTransactionsMock.mockReturnValue(
        changedStatusTransactions,
      )
      getTransactionStatusMock.mockReturnValue({ finality_status: "REJECTED" })

      const onRejectedTransactionSpy = vi.spyOn(worker, "onRejectedTransaction")
      const changeSet: StorageChange<Transaction[]> = {
        newValue: changedStatusTransactions,
        oldValue: [],
      }

      worker.onTransactionRepoChange(changeSet)

      expect(onRejectedTransactionSpy).toHaveBeenCalledWith(rejectedTransaction)
    })

    it("should not call onRejectedTransaction for non-rejected transactions", () => {
      const nonRejectedTransaction = {
        account: getMockAccount(),
      } as any

      const changedStatusTransactions = [nonRejectedTransaction]
      const getChangedStatusTransactionsMock = vi.mocked(
        getChangedStatusTransactions,
      )
      const getTransactionStatusMock = vi.mocked(getTransactionStatus)
      getChangedStatusTransactionsMock.mockReturnValue(
        changedStatusTransactions,
      )
      getTransactionStatusMock.mockReturnValue({
        finality_status: "ACCEPTED_ON_L2",
      })

      const onRejectedTransactionSpy = vi.spyOn(worker, "onRejectedTransaction")
      const changeSet: StorageChange<Transaction[]> = {
        newValue: changedStatusTransactions,
        oldValue: [],
      }

      worker.onTransactionRepoChange(changeSet)

      expect(onRejectedTransactionSpy).not.toHaveBeenCalled()
    })
  })

  describe("onRejectedTransaction", () => {
    it("should call refreshLocalNonce with the account id of the rejected transaction", async () => {
      const accountId: AccountId = "test-account"
      const rejectedTransaction = {
        account: { id: accountId },
      } as any
      const refreshLocalNonceSpy = vi.spyOn(worker, "refreshLocalNonce")
      await worker.onRejectedTransaction(rejectedTransaction)
      expect(refreshLocalNonceSpy).toHaveBeenCalledWith(accountId)
    })
  })
})
