import type { WalletSession } from "./WalletAccountSharedService"
import { WalletAccountSharedService } from "./WalletAccountSharedService"
import type { WalletStorageProps } from "../../../wallet/walletStore"

import type { BaseMultisigWalletAccount } from "../../../wallet.model"
import { defaultNetworkOnlyPlaceholderAccount } from "../../../wallet.model"
import type { PendingMultisig } from "../../../multisig/types"

import type { WalletAccount } from "../../../wallet.model"
import type {
  IObjectStore,
  IRepository,
} from "../../../storage/__new/interface"
import { getRandomAccountIdentifier } from "../../../utils/accountIdentifier"
import {
  accountServiceMock,
  getMultisigStoreMock,
  getPendingMultisigStoreMock,
  getSessionStoreMock,
  getStoreMock,
  getWalletStoreMock,
  httpServiceMock,
} from "../../../test.utils"

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
        httpServiceMock,
        accountServiceMock,
      )

      const result = await service.getAccount(accountMock.id)

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
        httpServiceMock,
        accountServiceMock,
      )

      await expect(service.getAccount(accountMock.id)).rejects.toThrow(
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
        httpServiceMock,
        accountServiceMock,
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
        httpServiceMock,
        accountServiceMock,
      )

      const result = await service.getSelectedAccount()

      expect(sessionStoreMock.get).toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe("selectAccount", () => {
    it("should set selected account to defaultNetworkOnlyPlaceholderAccount when no account identifier is provided", async () => {
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
        httpServiceMock,
        accountServiceMock,
      )

      await service.selectAccount()

      expect(storeMock.set).toHaveBeenCalledWith({
        selected: defaultNetworkOnlyPlaceholderAccount,
      })
    })

    it("should throw an error when the selected account is not found", async () => {
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
        httpServiceMock,
        accountServiceMock,
      )

      await expect(service.selectAccount("abc")).rejects.toThrow(
        "Account not found",
      )
    })

    it("should set selected account and return it when a valid account identifier is provided", async () => {
      const accountIdentifierMock = getRandomAccountIdentifier(
        "0x2",
        "networkId2",
      )
      const accountsMock = [
        {
          address: "0x1",
          networkId: "networkId1",
          id: getRandomAccountIdentifier(),
        },
        { address: "0x2", networkId: "networkId2", id: accountIdentifierMock },
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
        httpServiceMock,
        accountServiceMock,
      )

      const result = await service.selectAccount(accountIdentifierMock)

      expect(walletStoreMock.get).toHaveBeenCalled()

      expect(storeMock.set).toHaveBeenCalledWith({
        selected: {
          id: accountIdentifierMock,
          address: accountsMock[1].address,
          networkId: accountsMock[1].networkId,
        },
      })
      expect(result).toEqual(accountsMock[1])
    })
  })

  describe("getMultisigAccount", () => {
    it("should return the multisig wallet account when found", async () => {
      const id = getRandomAccountIdentifier()
      const accountIdentifierMock = {
        address: "address",
        networkId: "networkId",
        id,
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
        httpServiceMock,
        accountServiceMock,
      )

      const result = await service.getMultisigAccount(accountIdentifierMock.id)

      expect(walletStoreMock.get).toHaveBeenCalledWith(expect.any(Function))
      expect(multisigStoreMock.get).toHaveBeenCalledWith(expect.any(Function))
      expect(result).toEqual(expectedMultisigAccountMock)
    })

    it("should throw an error when multisig wallet account not found", async () => {
      const id = getRandomAccountIdentifier()
      const accountIdentifierMock = {
        address: "address",
        networkId: "networkId",
        id,
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
        httpServiceMock,
        accountServiceMock,
      )

      await expect(
        service.getMultisigAccount(accountIdentifierMock.id),
      ).rejects.toThrow("Multisig base wallet account not found")
    })
  })

  describe("getLastUsedAccountOnNetwork", () => {
    it("should return the last used account on network", async () => {
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
            selected: {
              id: accountsMock[0].id,
              address: accountsMock[0].address,
              networkId: accountsMock[0].networkId,
            },
            lastUsedAccountByNetwork: {
              networkId1: {
                id: accountsMock[0].id,
                address: accountsMock[0].address,
                networkId: accountsMock[0].networkId,
              },
            },
          }),
        ),
      })
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
        httpServiceMock,
        accountServiceMock,
      )

      await service.selectAccount(accountsMock[0].id)
      const result = await service.getSelectedAccount()

      expect(sessionStoreMock.get).toHaveBeenCalled()
      expect(walletStoreMock.get).toHaveBeenCalled()
      expect(storeMock.get).toHaveBeenCalled()

      expect(result).toEqual({
        id: accountsMock[0].id,
        address: accountsMock[0].address,
        networkId: accountsMock[0].networkId,
      })

      const lastUsedAccountByNetwork =
        await service.getLastUsedAccountOnNetwork("networkId1")
      expect(lastUsedAccountByNetwork).toEqual({
        id: accountsMock[0].id,
        address: accountsMock[0].address,
        networkId: accountsMock[0].networkId,
      })
    })
  })
})
