import { TXV1_ACCOUNT_CLASS_HASH, addressSchema } from "@argent/x-shared"
import type { Mocked } from "vitest"
import { describe, expect, it, vi } from "vitest"

import { getMockWalletAccount } from "../../../../../test/walletAccount.mock"
import type { IAccountService } from "../../../../shared/account/service/accountService/IAccountService"
import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type { IActivityService } from "../../activity/IActivityService"
import { AccountWorker } from "./AccountWorker"
import { mockAccountsWithoutId } from "../../../../../test/accountsWithoutId.mock"
import { accountIdSchema, SignerType } from "../../../../shared/wallet.model"
import {
  getAccountIdentifier,
  getRandomAccountIdentifier,
} from "../../../../shared/utils/accountIdentifier"
import { stark } from "starknet"
import { getStoreMock } from "../../../../shared/test.utils"
import type { AnalyticsService } from "../../../../shared/analytics/AnalyticsService"

vi.mock("../../../../shared/account/details/getAccountCairoVersionFromChain")

const address = stark.randomAddress()

describe("AccountWorker", () => {
  let ampliService: Mocked<AnalyticsService>

  beforeEach(() => {
    vi.resetAllMocks()
  })

  const makeService = () => {
    const accountService = {
      get: () =>
        Promise.resolve([
          getMockWalletAccount({
            id: getRandomAccountIdentifier(address),
            address,
          }),
        ]),
      getArgentWalletAccounts: () =>
        Promise.resolve([
          getMockWalletAccount({
            id: getRandomAccountIdentifier(address),
            address,
          }),
        ]),
      getDeployed: () => Promise.resolve(true),
      upsert: vi.fn(),
      remove: vi.fn(),
      setHide: vi.fn(),
      setName: vi.fn(),
    } as unknown as Mocked<IAccountService>

    const scheduleService = {
      registerImplementation: vi.fn(),
      in: vi.fn(),
      every: vi.fn(),
      delete: vi.fn(),
      onInstallAndUpgrade: vi.fn(),
      onStartup: vi.fn(),
    } as unknown as Mocked<IScheduleService>

    const activityService = {
      emitter: {
        on: vi.fn(),
      },
    } as unknown as Mocked<IActivityService>

    ampliService = {
      identify: vi.fn(),
    } as unknown as Mocked<AnalyticsService>

    const walletStore = getStoreMock()

    const accountWorker = new AccountWorker(
      walletStore,
      accountService,
      activityService,
      scheduleService,
      ampliService,
    )

    return {
      walletStore,
      accountWorker,
      accountService,
      activityService,
      scheduleService,
    }
  }

  it("should update all accounts", async () => {
    const { accountWorker: worker, walletStore } = makeService()

    const spyUpdateDeployed = vi.spyOn(worker, "updateDeployed")
    const spyUpdateAccountClassHash = vi.spyOn(worker, "updateAccountClassHash")
    const spyUpdateAccountCairoVersion = vi.spyOn(
      worker,
      "updateAccountCairoVersion",
    )

    walletStore.get = vi.fn().mockResolvedValueOnce({})

    await worker.runUpdaterForAllTasks()

    expect(spyUpdateDeployed).toHaveBeenCalled()
    expect(spyUpdateAccountClassHash).toHaveBeenCalled()
    expect(spyUpdateAccountCairoVersion).toHaveBeenCalled()
    expect(ampliService.identify).toHaveBeenCalled()
  })

  it("should correctly identify accounts", async () => {
    const { accountWorker: worker, accountService, walletStore } = makeService()

    const spyUpdateDeployed = vi.spyOn(worker, "updateDeployed")
    const spyUpdateAccountClassHash = vi.spyOn(worker, "updateAccountClassHash")
    const spyUpdateAccountCairoVersion = vi.spyOn(
      worker,
      "updateAccountCairoVersion",
    )

    accountService.get = vi.fn().mockResolvedValue([
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "standard",
        networkId: "mainnet-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "standard",
        networkId: "sepolia-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "smart",
        networkId: "mainnet-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "smart",
        networkId: "sepolia-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "multisig",
        networkId: "mainnet-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "multisig",
        networkId: "sepolia-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "standard",
        signer: {
          type: SignerType.LEDGER,
          derivationPath: "m/44'/9004'/0'/0/0",
        },
        networkId: "mainnet-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "standard",
        signer: {
          type: SignerType.LEDGER,
          derivationPath: "m/44'/9004'/0'/0/0",
        } as any,
        networkId: "sepolia-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "multisig",
        signer: {
          type: SignerType.LEDGER,
          derivationPath: "m/44'/9004'/0'/0/0",
        } as any,
        networkId: "mainnet-alpha",
      }),
      getMockWalletAccount({
        address: "0x0000000000000000000000000000000000000000000000000",
        type: "multisig",
        signer: {
          type: SignerType.LEDGER,
          derivationPath: "m/44'/9004'/0'/0/0",
        } as any,
        networkId: "sepolia-alpha",
      }),
    ])

    walletStore.get = vi.fn().mockResolvedValueOnce({})

    await worker.runUpdaterForAllTasks()

    expect(spyUpdateDeployed).toHaveBeenCalled()
    expect(spyUpdateAccountClassHash).toHaveBeenCalled()
    expect(spyUpdateAccountCairoVersion).toHaveBeenCalled()
    expect(ampliService.identify).toHaveBeenCalledWith(undefined, {
      "ArgentX Ledger Accounts Count": 2,
      "ArgentX Multisig Accounts Count": 2,
      "ArgentX Smart Accounts Count": 1,
      "ArgentX Standard Accounts Count": 2,
      "ArgentX Testnet Accounts Count": 5,
    })
  })

  it("should update account class hash", async () => {
    const { accountWorker: worker } = makeService()

    const spyGetAccountClassHashFromChain = vi.spyOn(
      worker,
      "updateAccountClassHash",
    )

    await worker.updateAccountClassHash()

    expect(spyGetAccountClassHashFromChain).toHaveBeenCalled()
  })

  it("should update account cairo version", async () => {
    const { accountWorker: worker } = makeService()

    const spyGetAccountCairoVersionFromChain = vi.spyOn(
      worker,
      "updateAccountCairoVersion",
    )

    await worker.updateAccountCairoVersion()

    expect(spyGetAccountCairoVersionFromChain).toHaveBeenCalled()
  })

  it("should call upsert with correct parameters on updateDeployed", async () => {
    const { accountWorker: worker, accountService } = makeService()

    const mockAccount = getMockWalletAccount({ needsDeploy: true })

    accountService.get = vi.fn().mockResolvedValueOnce([mockAccount])
    accountService.getDeployed = vi.fn().mockResolvedValueOnce(true)

    await worker.updateDeployed()

    expect(accountService.upsert).toHaveBeenCalledWith([
      {
        ...mockAccount,
        needsDeploy: false,
      },
    ])
  })

  it("should call upsert with correct parameters on updateAccountClassHash", async () => {
    const { accountWorker: worker, accountService } = makeService()

    const mockAccount = getMockWalletAccount({ classHash: undefined })

    accountService.getArgentWalletAccounts = vi
      .fn()
      .mockResolvedValueOnce([mockAccount])

    await worker.updateAccountClassHash()

    expect(accountService.upsert).toHaveBeenCalledWith([
      {
        ...mockAccount,
        classHash: addressSchema.parse(TXV1_ACCOUNT_CLASS_HASH),
      },
    ])
  })

  it("should call upsert with correct parameters on updateAccountCairoVersion", async () => {
    const { accountWorker: worker, accountService } = makeService()

    const mockAccount = getMockWalletAccount({ cairoVersion: undefined })

    accountService.getArgentWalletAccounts = vi
      .fn()
      .mockResolvedValueOnce([mockAccount])

    // don't know why this works, but it does
    // https://stackoverflow.com/a/74490815
    const module = await import(
      "../../../../shared/account/details/getAccountCairoVersionFromChain"
    )
    module.getAccountCairoVersionFromChain = vi.fn().mockResolvedValue([
      {
        ...mockAccount,
        cairoVersion: "1",
      },
    ])

    await worker.updateAccountCairoVersion()

    expect(accountService.upsert).toHaveBeenCalledWith([
      {
        ...mockAccount,
        cairoVersion: "1",
      },
    ])
  })

  it("should call upsert in updateAccountId with correct parameters", async () => {
    const { accountWorker: worker, accountService, walletStore } = makeService()

    accountService.get = vi.fn().mockResolvedValueOnce(mockAccountsWithoutId)

    accountService.remove = vi.fn()
    walletStore.get = vi.fn().mockResolvedValueOnce({
      selectedAccount: {
        id: getRandomAccountIdentifier(address),
        address: mockAccountsWithoutId[0].address,
        networkId: mockAccountsWithoutId[0].networkId,
      },
    })

    await worker.updateAccountId()

    expect(accountService.upsert).toHaveBeenCalledWith(
      mockAccountsWithoutId.map((account) => ({
        ...account,
        id: accountIdSchema.parse(
          getAccountIdentifier(
            account.address,
            account.networkId,
            account.signer as any,
          ),
        ),
      })),
    )

    // Ensure updateSelectedAccount is called to handle the selected account update
    expect(walletStore.get).toHaveBeenCalled()
  })

  it("should call upsert in walletStore with correct parameters on updateAccountId", async () => {
    const { accountWorker: worker, accountService, walletStore } = makeService()

    const randomId1 = getRandomAccountIdentifier(
      mockAccountsWithoutId[0].address,
    )
    const randomId2 = getRandomAccountIdentifier(
      mockAccountsWithoutId[1].address,
    )

    accountService.get = vi.fn().mockReturnValue([
      { ...mockAccountsWithoutId[0], id: randomId1 },
      {
        ...mockAccountsWithoutId[1],
        id: randomId2,
        networkId: "mainnet-alpha",
      },
    ])

    walletStore.get = vi.fn().mockResolvedValueOnce({
      lastUsedAccountByNetwork: {
        "sepolia-alpha": {
          ...mockAccountsWithoutId[0],
        },
        "mainnet-alpha": {
          address: mockAccountsWithoutId[1].address,
          networkId: "mainnet-alpha",
        },
      },
    })

    await worker.updateAccountId()

    expect(walletStore.set).toHaveBeenCalledWith({
      lastUsedAccountByNetwork: {
        "sepolia-alpha": {
          address: mockAccountsWithoutId[0].address,
          networkId: "sepolia-alpha",
          id: randomId1,
        },
        "mainnet-alpha": {
          address: mockAccountsWithoutId[1].address,
          networkId: "mainnet-alpha",
          id: randomId2,
        },
      },
    })
  })
})
