import { AccountUpdaterTaskId, AccountWorker } from "./implementation"
import { IAccountService } from "../../account/service/interface"
import { IScheduleService } from "../../schedule/interface"
import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import { addressSchema } from "@argent/shared"
import { STANDARD_ACCOUNT_CLASS_HASH } from "../../network/constants"
import { noop } from "lodash-es"

vi.mock("../details/getAccountCairoVersionFromChain")

describe("AccountWorker", () => {
  let accountServiceMock: IAccountService
  let scheduleService: IScheduleService<AccountUpdaterTaskId.UPDATE_DEPLOYED>

  beforeEach(() => {
    vi.resetAllMocks()
    accountServiceMock = vi.mocked<IAccountService>({
      get: () => Promise.resolve([getMockWalletAccount({})]),
      getDeployed: () => Promise.resolve(true),
      upsert: vi.fn(),
      select: vi.fn(),
      remove: vi.fn(),
      create: vi.fn(),
      deploy: vi.fn(),
      upgrade: vi.fn(),
      setHide: vi.fn(),
      setName: vi.fn(),
    })

    scheduleService = {
      registerImplementation: vi.fn(),
      in: vi.fn(),
      every: vi.fn(),
      delete: vi.fn(),
      onInstallAndUpgrade: vi.fn(),
      onStartup: vi.fn(),
    }
  })

  it("should update all accounts", async () => {
    const worker = new AccountWorker(accountServiceMock, scheduleService)

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
    const worker = new AccountWorker(accountServiceMock, scheduleService)

    const spyGetAccountClassHashFromChain = vi.spyOn(
      worker,
      "updateAccountClassHash",
    )

    await worker.updateAccountClassHash()

    expect(spyGetAccountClassHashFromChain).toHaveBeenCalled()
  })

  it("should update account cairo version", async () => {
    const worker = new AccountWorker(accountServiceMock, scheduleService)

    const spyGetAccountCairoVersionFromChain = vi.spyOn(
      worker,
      "updateAccountCairoVersion",
    )

    await worker.updateAccountCairoVersion()

    expect(spyGetAccountCairoVersionFromChain).toHaveBeenCalled()
  })

  it("should call upsert with correct parameters on updateDeployed", async () => {
    const mockAccount = getMockWalletAccount({ needsDeploy: true })

    const mockAccountService = vi.mocked<IAccountService>({
      ...accountServiceMock,
      get: vi.fn().mockResolvedValue([mockAccount]),
      getDeployed: vi.fn().mockResolvedValue(true),
    })

    const worker = new AccountWorker(mockAccountService, scheduleService)

    const spyAccountServiceUpsert = vi.spyOn(mockAccountService, "upsert")

    await worker.updateDeployed()

    expect(spyAccountServiceUpsert).toHaveBeenCalledWith([
      {
        ...mockAccount,
        needsDeploy: false,
      },
    ])
  })

  it("should call upsert with correct parameters on updateAccountClassHash", async () => {
    const mockAccount = getMockWalletAccount({ classHash: undefined })

    const mockAccountService = vi.mocked<IAccountService>({
      ...accountServiceMock,
      get: vi.fn().mockResolvedValue([mockAccount]),
    })

    const worker = new AccountWorker(mockAccountService, scheduleService)

    worker.updateAccountClassHashImmediately = vi
      .fn()
      .mockImplementationOnce(noop)

    const spyAccountServiceUpsert = vi.spyOn(mockAccountService, "upsert")

    await worker.updateAccountClassHash()

    expect(spyAccountServiceUpsert).toHaveBeenCalledWith([
      {
        ...mockAccount,
        classHash: addressSchema.parse(STANDARD_ACCOUNT_CLASS_HASH),
      },
    ])
  })

  it("should call upsert with correct parameters on updateAccountCairoVersion", async () => {
    const mockAccount = getMockWalletAccount({ cairoVersion: undefined })

    // don't know why this works, but it does
    // https://stackoverflow.com/a/74490815
    const module = await import("../details/getAccountCairoVersionFromChain")
    module.getAccountCairoVersionFromChain = vi.fn().mockResolvedValue([
      {
        ...mockAccount,
        cairoVersion: "1",
      },
    ])

    const mockAccountService = vi.mocked<IAccountService>({
      ...accountServiceMock,
      get: vi.fn().mockResolvedValue([mockAccount]),
    })

    const worker = new AccountWorker(mockAccountService, scheduleService)

    worker.updateAccountClassHashImmediately = vi
      .fn()
      .mockImplementationOnce(noop)

    const spyAccountServiceUpsert = vi.spyOn(mockAccountService, "upsert")

    await worker.updateAccountCairoVersion()

    expect(spyAccountServiceUpsert).toHaveBeenCalledWith([
      {
        ...mockAccount,
        cairoVersion: "1",
      },
    ])
  })
})
