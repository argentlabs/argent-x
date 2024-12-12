import type { Mocked } from "vitest"
import { mockChainService } from "../../../chain/service/__test__/mock"
import { MockFnRepository } from "../../../storage/__new/__test__/mockFunctionImplementation"
import type { BaseWalletAccount, WalletAccount } from "../../../wallet.model"
import { AccountService } from "./AccountService"
import type { IPKManager } from "../../../accountImport/pkManager/IPKManager"
import { emitterMock } from "../../../test.utils"

describe("AccountService", () => {
  let accountRepo: MockFnRepository<WalletAccount>
  let accountService: AccountService

  let mockPkManager: Mocked<IPKManager>

  beforeEach(() => {
    accountRepo = new MockFnRepository()
    mockPkManager = {
      storeEncryptedKey: vi.fn(),
      retrieveDecryptedKey: vi.fn(),
      removeKey: vi.fn(),
    } as Mocked<IPKManager>
    accountService = new AccountService(
      emitterMock,
      mockChainService,
      accountRepo,
      mockPkManager,
    )
  })

  describe("get", () => {
    it("should return accounts based on the provided selector", async () => {
      const accounts: WalletAccount[] = [
        { address: "0x123", networkId: "0x1", name: "test1" } as WalletAccount,
      ]
      accountRepo.get.mockResolvedValue(accounts)

      const result = await accountService.get()

      expect(accountRepo.get).toHaveBeenCalled()
      expect(result).toEqual(accounts)
    })
  })

  describe("upsert", () => {
    it("should upsert accounts to the accountRepo", async () => {
      const accounts: WalletAccount[] = [
        /* mock array of WalletAccount */
      ]
      await accountService.upsert(accounts)

      expect(accountRepo.upsert).toHaveBeenCalledWith(accounts)
    })
  })

  describe("remove", () => {
    it("should remove accounts from the accountRepo", async () => {
      const baseAccount: BaseWalletAccount = {
        id: "0x123-0x1-local_secret",
        address: "0x123",
        networkId: "0x1",
      }

      accountRepo.get.mockResolvedValue([baseAccount])
      await accountService.removeById(baseAccount.id)

      expect(accountRepo.remove).toHaveBeenCalled()
    })
  })

  describe("getDeployed", () => {
    it("should return mock value", async () => {
      const result = await accountService.getDeployed({
        id: "0x123-0x1-local_secret",
        address: "0x123",
        networkId: "0x1",
      })

      expect(result).toEqual(true)
    })
  })
})
