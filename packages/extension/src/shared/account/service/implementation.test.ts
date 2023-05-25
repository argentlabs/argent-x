import { messageClient } from "../../../ui/services/messaging/trpc"
import {
  MockFnObjectStore,
  MockFnRepository,
} from "../../storage/__new/__test__/mockFunctionImplementation"
import type { BaseWalletAccount, WalletAccount } from "../../wallet.model"
import type { IWalletStore } from "../../wallet/walletStore"
import { AccountService } from "./implementation"

describe("AccountService", () => {
  let accountRepo: MockFnRepository<WalletAccount>
  let walletStore: IWalletStore
  let accountService: AccountService

  beforeEach(() => {
    accountRepo = new MockFnRepository()
    walletStore = new MockFnObjectStore()
    accountService = new AccountService(accountRepo, walletStore, messageClient)
  })

  describe("select", () => {
    it("should update wallet store with selected account", async () => {
      const baseAccount: BaseWalletAccount = {
        address: "0x123",
        networkId: "0x1",
        // @ts-expect-error extraValue is not part of BaseWalletAccount
        extraValue: "extraValue",
      }
      await accountService.select(baseAccount)

      expect(walletStore.set).toHaveBeenCalledWith({
        selected: {
          address: baseAccount.address,
          networkId: baseAccount.networkId,
        },
      })
    })

    it("should set selected account to null if baseAccount is null", async () => {
      await accountService.select(null)

      expect(walletStore.set).toHaveBeenCalledWith({ selected: null })
    })
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
        address: "0x123",
        networkId: "0x1",
      }
      await accountService.remove(baseAccount)

      expect(accountRepo.remove).toHaveBeenCalled()
    })
  })
})
