import type { Mocked } from "vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { getMockAccount } from "../../../../test/account.mock"
import {
  getAccountStoreMock,
  getMultisigStoreMock,
  getSettingsStoreMock,
  getStoreMock,
} from "../../../shared/test.utils"
import type { IClientAccountService } from "../../services/account/IClientAccountService"
import type { WalletStorageProps } from "../../../shared/wallet/walletStore"
import type { IObjectStore } from "../../../shared/storage/__new/interface"
import { ClientAccountService } from "./ClientAccountService"
import type { IMultisigService } from "../../../shared/multisig/service/messaging/IMultisigService"
import type { KeyValueStorage } from "../../../shared/storage"
import type { ISettingsStorage } from "../../../shared/settings/types"
import type { WalletAccount } from "../../../shared/wallet.model"
import type { MockFnRepository } from "../../../shared/storage/__new/__test__/mockFunctionImplementation"

describe("ClientAccountService", () => {
  describe("autoSelectAccountOnNetwork", () => {
    let walletStoreMock: IObjectStore<WalletStorageProps>
    let accountRepo: MockFnRepository<WalletAccount>
    let clientAccountService: IClientAccountService

    const mockAccount = getMockAccount()

    const multisigService = {
      addAccount: vi.fn(),
      deploy: vi.fn(),
    } as unknown as Mocked<IMultisigService>

    beforeEach(() => {
      vi.resetAllMocks()
      walletStoreMock = getStoreMock()
      accountRepo = getAccountStoreMock()

      clientAccountService = new ClientAccountService(
        accountRepo,
        walletStoreMock,
        getMultisigStoreMock(),
        multisigService,
        getSettingsStoreMock() as unknown as KeyValueStorage<ISettingsStorage>,
      )
    })

    it("should return null when there are no visible accounts on the network", async () => {
      vi.spyOn(accountRepo, "get").mockResolvedValue([])
      vi.spyOn(walletStoreMock, "get").mockResolvedValue({
        selected: mockAccount,
      })
      vi.spyOn(clientAccountService, "select").mockResolvedValue(undefined)

      const result =
        await clientAccountService.autoSelectAccountOnNetwork("testNetwork")

      expect(result).toBeNull()
      expect(clientAccountService.select).toHaveBeenCalledWith({
        networkId: "testNetwork",
        address: null,
        id: null,
      })
    })

    it("should select existing account on network if available", async () => {
      const selectedAccount = getMockAccount()
      const visibleAccounts = [selectedAccount]

      vi.spyOn(accountRepo, "get").mockResolvedValue(visibleAccounts)

      vi.spyOn(walletStoreMock, "get").mockResolvedValue({
        selected: selectedAccount,
      })

      vi.spyOn(clientAccountService, "select").mockResolvedValue(undefined)
      vi.spyOn(
        clientAccountService,
        "getLastUsedAccountOnNetwork",
      ).mockResolvedValue(undefined)

      const result =
        await clientAccountService.autoSelectAccountOnNetwork("testNetwork")

      expect(result).toEqual(selectedAccount)
      expect(clientAccountService.select).toHaveBeenCalledWith(
        selectedAccount.id,
      )
    })

    it("should select last used account on network if available", async () => {
      const lastUsedAccount = getMockAccount()
      const visibleAccounts = [lastUsedAccount]

      vi.spyOn(walletStoreMock, "get").mockResolvedValue({
        selected: mockAccount,
      })
      vi.spyOn(accountRepo, "get").mockResolvedValue(visibleAccounts)

      vi.spyOn(
        clientAccountService,
        "getLastUsedAccountOnNetwork",
      ).mockResolvedValue(lastUsedAccount)
      vi.spyOn(clientAccountService, "select").mockResolvedValue(undefined)

      const result =
        await clientAccountService.autoSelectAccountOnNetwork("testNetwork")

      expect(result).toEqual(lastUsedAccount)
      expect(clientAccountService.select).toHaveBeenCalledWith(
        lastUsedAccount.id,
      )
    })

    it("should select first visible account when no existing or last used account is available", async () => {
      const firstVisibleAccount = getMockAccount()
      const visibleAccounts = [firstVisibleAccount]

      vi.mocked(walletStoreMock.get).mockResolvedValue({})
      vi.spyOn(accountRepo, "get").mockResolvedValue(visibleAccounts)

      vi.spyOn(
        clientAccountService,
        "getLastUsedAccountOnNetwork",
      ).mockResolvedValue(undefined)
      vi.spyOn(clientAccountService, "select").mockResolvedValue(undefined)

      const result =
        await clientAccountService.autoSelectAccountOnNetwork("testNetwork")

      expect(result).toEqual(firstVisibleAccount)
      expect(clientAccountService.select).toHaveBeenCalledWith(
        firstVisibleAccount.id,
      )
    })
  })
})
