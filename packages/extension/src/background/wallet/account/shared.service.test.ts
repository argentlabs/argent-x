import { WalletAccountSharedService, WalletSession } from "./shared.service"
import { WalletStorageProps } from "../../../shared/wallet/walletStore"

import { BaseMultisigWalletAccount } from "../../../shared/wallet.model"
import { PendingMultisig } from "../../../shared/multisig/types"

import { WalletAccount } from "../../../shared/wallet.model"
import {
  getMultisigStoreMock,
  getPendingMultisigStoreMock,
  getSessionStoreMock,
  getStoreMock,
  getWalletStoreMock,
} from "../test.utils"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"

describe("WalletAccountSharedService", () => {
  let service: WalletAccountSharedService
  let storeMock: IObjectStore<WalletStorageProps>
  let walletStoreMock: IRepository<WalletAccount>
  let sessionStoreMock: IObjectStore<WalletSession | null>
  let multisigStoreMock: IRepository<BaseMultisigWalletAccount>
  let pendingMultisigStoreMock: IRepository<PendingMultisig>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("getAccount", () => {
    it("should return the account when found", async () => {
      const accountMock = {
        address: "address",
        networkId: "networkId",
      } as WalletAccount
      const accountsMock = [accountMock]
      storeMock = getStoreMock()
      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve(accountsMock)),
      })
      sessionStoreMock = getSessionStoreMock()
      multisigStoreMock = getMultisigStoreMock()
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      const result = await service.getAccount(accountMock)

      expect(walletStoreMock.get).toHaveBeenCalledWith(expect.any(Function))
      expect(result).toEqual(accountMock)
    })

    it("should throw an error when account not found", async () => {
      const accountMock = {
        address: "address",
        networkId: "networkId",
      } as WalletAccount
      const accountsMock = [] as WalletAccount[]
      storeMock = getStoreMock()
      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve(accountsMock)),
      })
      sessionStoreMock = getSessionStoreMock()
      multisigStoreMock = getMultisigStoreMock()
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      await expect(service.getAccount(accountMock)).rejects.toThrow(
        "Account not found",
      )
    })
  })

  describe("getSelectedAccount", () => {
    it("should return the selected account when session is set and selected account exists", async () => {
      const sessionMock = { secret: "secret", password: "password" }
      const accountsMock = [
        { address: "address1", networkId: "networkId1" },
        { address: "address2", networkId: "networkId2" },
      ] as WalletAccount[]

      storeMock = getStoreMock({
        set: vi.fn(),
        subscribe: vi.fn(),
        namespace: "",
        get: vi.fn(() =>
          Promise.resolve({
            selected: accountsMock[0],
          }),
        ),
      })
      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve(accountsMock)),
      })
      sessionStoreMock = getSessionStoreMock({
        get: vi.fn(() => Promise.resolve(sessionMock)),
      })
      multisigStoreMock = getMultisigStoreMock()
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      const result = await service.getSelectedAccount()

      expect(sessionStoreMock.get).toHaveBeenCalled()
      expect(walletStoreMock.get).toHaveBeenCalled()
      expect(storeMock.get).toHaveBeenCalled()
      expect(result).toEqual(accountsMock[0])
    })

    it("should return undefined when session is not set", async () => {
      storeMock = getStoreMock({
        set: vi.fn(),
        subscribe: vi.fn(),
        namespace: "",
        get: vi.fn(() =>
          Promise.resolve({
            selected: undefined,
          }),
        ),
      })

      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve([])),
      })
      sessionStoreMock = getSessionStoreMock()
      multisigStoreMock = getMultisigStoreMock()
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      const result = await service.getSelectedAccount()

      expect(sessionStoreMock.get).toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe("selectAccount", () => {
    it("should set selected account to null when no account identifier is provided", async () => {
      storeMock = getStoreMock()
      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve([])),
      })
      sessionStoreMock = getSessionStoreMock()
      multisigStoreMock = getMultisigStoreMock()
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      await service.selectAccount()

      expect(storeMock.set).toHaveBeenCalledWith({ selected: null })
    })

    it("should throw an error when the selected account is not found", async () => {
      const accountIdentifierMock = {
        address: "address",
        networkId: "networkId",
      }
      const accountsMock = [
        { address: "address1", networkId: "networkId1" },
        { address: "address2", networkId: "networkId2" },
      ] as WalletAccount[]
      storeMock = getStoreMock()
      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve(accountsMock)),
      })
      sessionStoreMock = getSessionStoreMock()
      multisigStoreMock = getMultisigStoreMock()
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      await expect(
        service.selectAccount(accountIdentifierMock),
      ).rejects.toThrow("Account not found")
    })

    it("should set selected account and return it when a valid account identifier is provided", async () => {
      const accountIdentifierMock = {
        address: "0x2",
        networkId: "networkId2",
      }
      const accountsMock = [
        { address: "0x1", networkId: "networkId1" },
        { address: "0x2", networkId: "networkId2" },
      ] as WalletAccount[]
      storeMock = getStoreMock()
      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve(accountsMock)),
      })
      sessionStoreMock = getSessionStoreMock()
      multisigStoreMock = getMultisigStoreMock()
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      const result = await service.selectAccount(accountIdentifierMock)

      expect(walletStoreMock.get).toHaveBeenCalled()

      expect(storeMock.set).toHaveBeenCalledWith({
        selected: {
          address: accountsMock[1].address,
          networkId: accountsMock[1].networkId,
        },
      })
      expect(result).toEqual(accountsMock[1])
    })
  })

  describe("getMultisigAccount", () => {
    it("should return the multisig wallet account when found", async () => {
      const accountIdentifierMock = {
        address: "address",
        networkId: "networkId",
      }
      const walletAccountMock = {
        address: "address",
        networkId: "networkId",
        type: "multisig",
      } as WalletAccount
      const multisigBaseWalletAccountMock = {
        baseWalletAccount: "baseWalletAccount",
      } as unknown as BaseMultisigWalletAccount
      const expectedMultisigAccountMock = {
        ...walletAccountMock,
        ...multisigBaseWalletAccountMock,
        type: "multisig",
      }

      storeMock = getStoreMock()
      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve([walletAccountMock])),
      })
      sessionStoreMock = getSessionStoreMock()
      multisigStoreMock = getMultisigStoreMock({
        get: vi.fn(() => Promise.resolve([multisigBaseWalletAccountMock])),
      })
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      const result = await service.getMultisigAccount(accountIdentifierMock)

      expect(walletStoreMock.get).toHaveBeenCalledWith(expect.any(Function))
      expect(multisigStoreMock.get).toHaveBeenCalledWith(expect.any(Function))
      expect(result).toEqual(expectedMultisigAccountMock)
    })

    it("should throw an error when multisig wallet account not found", async () => {
      const accountIdentifierMock = {
        address: "address",
        networkId: "networkId",
      }
      const walletAccountMock = {
        address: "address",
        networkId: "networkId",
        type: "standard",
      } as WalletAccount

      storeMock = getStoreMock()
      walletStoreMock = getWalletStoreMock({
        get: vi.fn(() => Promise.resolve([walletAccountMock])),
      })
      sessionStoreMock = getSessionStoreMock()
      multisigStoreMock = getMultisigStoreMock({
        get: vi.fn(() => Promise.resolve([])),
      })
      pendingMultisigStoreMock = getPendingMultisigStoreMock()

      service = new WalletAccountSharedService(
        storeMock,
        walletStoreMock,
        sessionStoreMock,
        multisigStoreMock,
        pendingMultisigStoreMock,
      )

      await expect(
        service.getMultisigAccount(accountIdentifierMock),
      ).rejects.toThrow("Multisig base wallet account not found")
    })
  })
})
