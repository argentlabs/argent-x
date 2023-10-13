import { PendingMultisig } from "../../shared/multisig/types"
import {
  MockFnObjectStore,
  MockFnRepository,
} from "../../shared/storage/__new/__test__/mockFunctionImplementation"
import { IObjectStore } from "../../shared/storage/__new/interface"
import {
  BaseMultisigWalletAccount,
  WalletAccount,
} from "../../shared/wallet.model"
import {
  WalletAccountSharedService,
  WalletSession,
  WalletStorageProps,
} from "./account/shared.service"
import { WalletAccountStarknetService } from "./account/starknet.service"
import { WalletBackupService } from "./backup/backup.service"
import { WalletCryptoSharedService } from "./crypto/shared.service"
import { WalletCryptoStarknetService } from "./crypto/starknet.service"
import { WalletDeploymentStarknetService } from "./deployment/starknet.service"
import { WalletRecoverySharedService } from "./recovery/shared.service"
import { WalletRecoveryStarknetService } from "./recovery/starknet.service"
import { WalletSessionService } from "./session/session.service"
import { Wallet } from "."
import { MultisigBackendService } from "../../shared/multisig/service/backend/implementation"

const isDev = true
const isTest = true
const isDevOrTest = isDev || isTest
const SCRYPT_N = isDevOrTest ? 64 : 262144
const SESSION_DURATION = isDev ? 24 * 60 * 60 : 30 * 60
const defaultKeyValueStorage = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  subscribe: vi.fn(),
  namespace: "",
  areaName: "local",
  defaults: {},
}

// Replace with class store after migration
const defaultArrayStorage = new MockFnRepository()

const defaultObjectStorage = new MockFnObjectStore()

const getKeyValueStorage = <T extends Record<string, any>>(
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

export const getSessionStoreMock = (
  overrides?: Partial<IObjectStore<WalletSession>>,
) => getObjectStorage<WalletSession>(overrides)

export const getMultisigStoreMock = (
  overrides?: Partial<MockFnRepository<BaseMultisigWalletAccount>>,
) => getArrayStorage<BaseMultisigWalletAccount>(overrides)

export const getPendingMultisigStoreMock = (
  overrides?: Partial<MockFnRepository<PendingMultisig>>,
) => getArrayStorage<PendingMultisig>(overrides)

export const loadContractsMock = vi.fn()
export const networkServiceMock = {
  getById: vi.fn(),
}

export const backupServiceMock = new WalletBackupService(
  getStoreMock(),
  getWalletStoreMock(),
  networkServiceMock,
)

const schedulingServiceMock = {
  in: vi.fn(),
  every: vi.fn(),
  delete: vi.fn(),
  registerImplementation: vi.fn(),
}

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

export const accountSharedServiceMock = new WalletAccountSharedService(
  getStoreMock(),
  getWalletStoreMock(),
  getSessionStoreMock(),
  getMultisigStoreMock(),
  getPendingMultisigStoreMock(),
)

export const cryptoStarknetServiceMock = new WalletCryptoStarknetService(
  getWalletStoreMock(),
  getSessionStoreMock({
    get: async () => ({
      secret:
        "0x12d584f675fd8e84637c84c610a39b4b6bae59e33d0dc75fbee0ab865c1ea2a8",
      password: "Test1234",
    }),
  }),
  getPendingMultisigStoreMock(),
  accountSharedServiceMock,
  loadContractsMock,
)

export const recoveryStarknetServiceMock = new WalletRecoveryStarknetService(
  getWalletStoreMock(),
  getMultisigStoreMock(),
  cryptoStarknetServiceMock,
  accountSharedServiceMock,
)

export const recoverySharedServiceMock = new WalletRecoverySharedService(
  emitterMock,
  getStoreMock(),
  getWalletStoreMock(),
  getSessionStoreMock(),
  networkServiceMock,
  recoveryStarknetServiceMock,
)

export const sessionServiceMock = new WalletSessionService(
  emitterMock,
  getStoreMock(),
  getSessionStoreMock(),
  backupServiceMock,
  recoverySharedServiceMock,
  schedulingServiceMock,
  SESSION_DURATION,
  SCRYPT_N,
)

export const multisigBackendServiceMock = new MultisigBackendService(
  "mockBackendUrl",
)

export const accountStarknetServiceMock = new WalletAccountStarknetService(
  getPendingMultisigStoreMock(),
  networkServiceMock,
  sessionServiceMock,
  accountSharedServiceMock,
  cryptoStarknetServiceMock,
  multisigBackendServiceMock,
)

export const deployStarknetServiceMock = new WalletDeploymentStarknetService(
  getWalletStoreMock(),
  getMultisigStoreMock(),
  getPendingMultisigStoreMock(),
  sessionServiceMock,
  getSessionStoreMock(),
  accountSharedServiceMock,
  accountStarknetServiceMock,
  cryptoStarknetServiceMock,
  backupServiceMock,
  networkServiceMock,
)

export const cryptoSharedServiceMock = new WalletCryptoSharedService(
  getSessionStoreMock(),
  sessionServiceMock,
  backupServiceMock,
  recoverySharedServiceMock,
  deployStarknetServiceMock,
  SCRYPT_N,
)

export const walletSingletonMock = new Wallet(
  accountSharedServiceMock,
  accountStarknetServiceMock,
  backupServiceMock,
  cryptoSharedServiceMock,
  cryptoStarknetServiceMock,
  deployStarknetServiceMock,
  recoverySharedServiceMock,
  recoveryStarknetServiceMock,
  sessionServiceMock,
)
