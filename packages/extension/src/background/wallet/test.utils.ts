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
} from "../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { WalletAccountStarknetService } from "./account/WalletAccountStarknetService"
import { WalletBackupService } from "./backup/WalletBackupService"
import { WalletCryptoSharedService } from "./crypto/WalletCryptoSharedService"
import { WalletCryptoStarknetService } from "./crypto/WalletCryptoStarknetService"
import { WalletDeploymentStarknetService } from "./deployment/WalletDeploymentStarknetService"
import { WalletRecoverySharedService } from "./recovery/WalletRecoverySharedService"
import { WalletRecoveryStarknetService } from "./recovery/WalletRecoveryStarknetService"
import { WalletSessionService } from "./session/WalletSessionService"
import { Wallet } from "."
import { MultisigBackendService } from "../../shared/multisig/service/backend/MultisigBackendService"
import { WalletStorageProps } from "../../shared/wallet/walletStore"
import { AnalyticsService } from "../../shared/analytics/AnalyticsService"
import { IReferralService } from "../services/referral/IReferralService"
import { KeyValueStorage } from "../../shared/storage"
import { ISettingsStorage } from "../../shared/settings/types"
import { IHttpService } from "@argent/x-shared"
import { LedgerSharedService } from "../../shared/ledger/service/LedgerSharedService"
import { StarknetChainService } from "../../shared/chain/service/StarknetChainService"
import { AccountService } from "../../shared/account/service/accountService/AccountService"

const isDev = true
const isTest = true
const isDevOrTest = isDev || isTest
const SCRYPT_N = isDevOrTest ? 64 : 262144
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

export const getAccountStoreMock = (
  overrides?: Partial<MockFnRepository<WalletAccount>>,
) => getArrayStorage<WalletAccount>(overrides)

export const loadContractsMock = vi.fn()
export const networkServiceMock = {
  getById: vi.fn(),
}

export const backupServiceMock = new WalletBackupService(
  getStoreMock(),
  getWalletStoreMock(),
  networkServiceMock,
)

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

const chainServiceMock = new StarknetChainService(networkServiceMock)

export const accountServiceMock = new AccountService(
  chainServiceMock,
  getAccountStoreMock(),
)

export const accountSharedServiceMock = new WalletAccountSharedService(
  getStoreMock(),
  getWalletStoreMock(),
  getSessionStoreMock(),
  getMultisigStoreMock(),
  getPendingMultisigStoreMock(),
  httpServiceMock,
  accountServiceMock,
)

export const ledgerServiceMock = new LedgerSharedService(
  networkServiceMock,
  multisigBackendServiceMock,
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
  ledgerServiceMock,
  loadContractsMock,
)

export const recoveryStarknetServiceMock = new WalletRecoveryStarknetService(
  getMultisigStoreMock(),
  multisigBackendServiceMock,
  ledgerServiceMock,
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
  SCRYPT_N,
)

export const accountStarknetServiceMock = new WalletAccountStarknetService(
  getPendingMultisigStoreMock(),
  networkServiceMock,
  sessionServiceMock,
  accountSharedServiceMock,
  cryptoStarknetServiceMock,
  multisigBackendServiceMock,
  ledgerServiceMock,
)
export const getDefaultReferralService = (): IReferralService => {
  return { trackReferral: () => Promise.resolve() }
}

export const analyticsServiceMock = new AnalyticsService(
  accountSharedServiceMock,
  getKeyValueStorage() as unknown as KeyValueStorage<ISettingsStorage>,
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
  analyticsServiceMock,
  getDefaultReferralService(),
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
