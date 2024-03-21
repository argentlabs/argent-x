import { Mocked, describe, expect, it, vi } from "vitest"
import { addressSchema } from "@argent/x-shared"

import { getMockWalletAccount } from "../../../../../../test/walletAccount.mock"
import { IAccountService } from "../../../../../shared/account/service/interface"
import { TXV1_ACCOUNT_CLASS_HASH } from "../../../../../shared/network/constants"
import { IScheduleService } from "../../../../../shared/schedule/interface"
import { IActivityService } from "../../activity/interface"
import { AccountWorker } from "./implementation"

vi.mock("../../../../../shared/account/details/getAccountCairoVersionFromChain")

describe("AccountWorker", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  const makeService = () => {
    const accountService = {
      get: () => Promise.resolve([getMockWalletAccount({})]),
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

    const accountWorker = new AccountWorker(
      accountService,
      activityService,
      scheduleService,
    )

    return {
      accountWorker,
      accountService,
      activityService,
      scheduleService,
    }
  }

  it("should update all accounts", async () => {
    const { accountWorker: worker } = makeService()

    const spyUpdateDeployed = vi.spyOn(worker, "updateDeployed")
    const spyUpdateAccountClassHash = vi.spyOn(worker, "updateAccountClassHash")
    const spyUpdateAccountCairoVersion = vi.spyOn(
      worker,
      "updateAccountCairoVersion",
    )

    await worker.runUpdaterForAllTasks()

    expect(spyUpdateDeployed).toHaveBeenCalled()
    expect(spyUpdateAccountClassHash).toHaveBeenCalled()
    expect(spyUpdateAccountCairoVersion).toHaveBeenCalled()
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

    accountService.get = vi.fn().mockResolvedValueOnce([mockAccount])

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

    accountService.get = vi.fn().mockResolvedValueOnce([mockAccount])

    // don't know why this works, but it does
    // https://stackoverflow.com/a/74490815
    const module = await import(
      "../../../../../shared/account/details/getAccountCairoVersionFromChain"
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
})
