import { Wallet } from "."
import { AccountImportSharedService } from "../../shared/accountImport/service/AccountImportSharedService"
import { AnalyticsService } from "../../shared/analytics/AnalyticsService"
import type { ISettingsStorage } from "../../shared/settings/types"
import { KeyValueStorage } from "../../shared/storage"
import {
  accountServiceMock,
  accountSharedServiceMock,
  emitterMock,
  getKeyValueStorage,
  getMultisigStoreMock,
  getPendingMultisigStoreMock,
  getStoreMock,
  getWalletStoreMock,
  ledgerServiceMock,
  loadContractsMock,
  multisigBackendServiceMock,
  networkServiceMock,
  pkManagerMock,
  SCRYPT_N_TEST,
} from "../../shared/test.utils"
import type { IReferralService } from "../services/referral/IReferralService"
import { WalletAccountStarknetService } from "./account/WalletAccountStarknetService"
import { WalletBackupService } from "./backup/WalletBackupService"
import { WalletCryptoSharedService } from "./crypto/WalletCryptoSharedService"
import { WalletCryptoStarknetService } from "./crypto/WalletCryptoStarknetService"
import { WalletDeploymentStarknetService } from "./deployment/WalletDeploymentStarknetService"
import { WalletRecoverySharedService } from "./recovery/WalletRecoverySharedService"
import { WalletRecoveryStarknetService } from "./recovery/WalletRecoveryStarknetService"
import { WalletSessionService } from "./session/WalletSessionService"
import type { ISessionStore } from "../../shared/session/storage"
import SecretStorageService from "./session/secretStorageService"
import type { ISecureServiceSessionStore } from "./session/interface"

const sessionStore = new KeyValueStorage<ISecureServiceSessionStore>(
  { exportedKey: "", salt: "", vault: "" },
  "test:sessionStore",
)
const mockSecretStorageService = new SecretStorageService(sessionStore)

vi.spyOn(mockSecretStorageService, "decrypt").mockImplementation(async () => {
  return {
    secret:
      "0x12d584f675fd8e84637c84c610a39b4b6bae59e33d0dc75fbee0ab865c1ea2a8",
    password: "Test1234",
  }
})

const mockSessionStore = new KeyValueStorage<ISessionStore>(
  {
    isUnlocked: false,
  },
  "test:wallet",
)

export const cryptoStarknetServiceMock = new WalletCryptoStarknetService(
  getWalletStoreMock(),
  mockSecretStorageService,
  getPendingMultisigStoreMock(),
  accountSharedServiceMock,
  ledgerServiceMock,
  pkManagerMock,
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
  mockSecretStorageService,
  networkServiceMock,
  recoveryStarknetServiceMock,
)

export const backupServiceMock = new WalletBackupService(
  getStoreMock(),
  getWalletStoreMock(),
  networkServiceMock,
)

export const sessionServiceMock = new WalletSessionService(
  emitterMock,
  getStoreMock(),
  mockSessionStore,
  mockSecretStorageService,
  backupServiceMock,
  recoverySharedServiceMock,
  SCRYPT_N_TEST,
)

export const importAccountServiceMock = new AccountImportSharedService(
  accountServiceMock,
  networkServiceMock,
  pkManagerMock,
)

export const accountStarknetServiceMock = new WalletAccountStarknetService(
  getPendingMultisigStoreMock(),
  networkServiceMock,
  sessionServiceMock,
  accountSharedServiceMock,
  cryptoStarknetServiceMock,
  multisigBackendServiceMock,
  ledgerServiceMock,
  importAccountServiceMock,
  mockSecretStorageService,
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
  sessionServiceMock,
  mockSecretStorageService,
  accountSharedServiceMock,
  accountStarknetServiceMock,
  cryptoStarknetServiceMock,
  backupServiceMock,
  networkServiceMock,
  analyticsServiceMock,
  getDefaultReferralService(),
)

export const cryptoSharedServiceMock = new WalletCryptoSharedService(
  mockSecretStorageService,
  sessionServiceMock,
  backupServiceMock,
  recoverySharedServiceMock,
  deployStarknetServiceMock,
  SCRYPT_N_TEST,
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
