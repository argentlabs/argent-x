import type { Mocked } from "vitest"
import type { IHttpService } from "@argent/x-shared"
import {
  MockFnObjectStore,
  MockFnRepository,
} from "./storage/__new/__test__/mockFunctionImplementation"
import type { IObjectStore } from "./storage/__new/interface"
import type { WalletStorageProps } from "./wallet/walletStore"
import type { BaseMultisigWalletAccount, WalletAccount } from "./wallet.model"
import { WalletAccountSharedService } from "./account/service/accountSharedService/WalletAccountSharedService"
import type { IPKStore } from "./accountImport/types"
import type { PendingMultisig } from "./multisig/types"
import { PKManager } from "./accountImport/pkManager/PKManager"
import { MultisigBackendService } from "./multisig/service/backend/MultisigBackendService"
import { StarknetChainService } from "./chain/service/StarknetChainService"
import { AccountService } from "./account/service/accountService/AccountService"
import { LedgerSharedService } from "./ledger/service/LedgerSharedService"
import type { ISettingsStorage } from "./settings/types"
import type { ISmartAccountService } from "./smartAccount/ISmartAccountService"
import type { ISessionStore } from "./session/storage"
import { KeyValueStorage } from "./storage"

const isDev = true
const isTest = true
const isDevOrTest = isDev || isTest
export const SCRYPT_N_TEST = isDevOrTest ? 64 : 262144
const defaultKeyValueStorage = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  subscribe: vi.fn(),
  namespace: "",
  areaName: "local",
  defaults: {},
}

export const httpServiceMock = {
  post: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
} as IHttpService

// Replace with class store after migration
const defaultArrayStorage = new MockFnRepository()

const defaultObjectStorage = new MockFnObjectStore()

export const getKeyValueStorage = <T extends Record<string, any>>(
  overrides?: Partial<IObjectStore<T>>,
): IObjectStore<T> => {
  return {
    ...defaultKeyValueStorage,
    ...overrides,
  } as IObjectStore<T>
}

const getArrayStorage = <T>(
  overrides?: Partial<MockFnRepository<T>>,
): MockFnRepository<T> => {
  return {
    ...defaultArrayStorage,
    ...overrides,
  } as MockFnRepository<T>
}

const getObjectStorage = <T>(
  overrides?: Partial<IObjectStore<T>>,
): IObjectStore<T | null> => {
  return {
    ...defaultObjectStorage,
    ...overrides,
  } as IObjectStore<T | null>
}

export const getStoreMock = (overrides?: IObjectStore<WalletStorageProps>) =>
  getKeyValueStorage<WalletStorageProps>(overrides)

export const getWalletStoreMock = (
  overrides?: Partial<MockFnRepository<WalletAccount>>,
) => getArrayStorage<WalletAccount>(overrides)

export const getPKStoreMock = (overrides?: Partial<IObjectStore<IPKStore>>) =>
  getKeyValueStorage<IPKStore>(overrides)

export const getMultisigStoreMock = (
  overrides?: Partial<MockFnRepository<BaseMultisigWalletAccount>>,
) => getArrayStorage<BaseMultisigWalletAccount>(overrides)

export const getPendingMultisigStoreMock = (
  overrides?: Partial<MockFnRepository<PendingMultisig>>,
) => getArrayStorage<PendingMultisig>(overrides)

export const getAccountStoreMock = (
  overrides?: Partial<MockFnRepository<WalletAccount>>,
) => getArrayStorage<WalletAccount>(overrides)

export const getSettingsStoreMock = (
  overrides?: Partial<IObjectStore<ISettingsStorage>>,
) => getKeyValueStorage<ISettingsStorage>(overrides)

export const loadContractsMock = vi.fn()
export const networkServiceMock = {
  getById: vi.fn(),
}

export const pkManagerMock = new PKManager(getPKStoreMock(), SCRYPT_N_TEST)

export const emitterMock = {
  anyEvent: vi.fn(),
  bindMethods: vi.fn(),
  clearListeners: vi.fn(),
  debug: vi.fn(),
  emit: vi.fn(),
  emitSerial: vi.fn(),
  events: vi.fn(),
  listenerCount: vi.fn(),
  off: vi.fn(),
  offAny: vi.fn(),
  on: vi.fn(),
  onAny: vi.fn(),
  once: vi.fn(),
}

export const multisigBackendServiceMock = new MultisigBackendService(
  "mockBackendUrl",
)

export const chainServiceMock = new StarknetChainService(networkServiceMock)

export const accountServiceMock = new AccountService(
  emitterMock,
  chainServiceMock,
  getAccountStoreMock(),
  pkManagerMock,
)

export const smartAccountServiceMock = {} as Mocked<ISmartAccountService>

export const accountSharedServiceMock = new WalletAccountSharedService(
  getStoreMock(),
  getWalletStoreMock(),
  new KeyValueStorage<ISessionStore>(
    {
      isUnlocked: false,
    },
    "test:wallet",
  ),
  getMultisigStoreMock(),
  getPendingMultisigStoreMock(),
  httpServiceMock,
  accountServiceMock,
  smartAccountServiceMock,
)

export const ledgerServiceMock = new LedgerSharedService(
  networkServiceMock,
  multisigBackendServiceMock,
)
