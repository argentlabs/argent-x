import { Wallet } from "."
import { AccountImportSharedService } from "../../shared/accountImport/service/AccountImportSharedService"
import { AnalyticsService } from "../../shared/analytics/AnalyticsService"
import type { ISettingsStorage } from "../../shared/settings/types"
import type { KeyValueStorage } from "../../shared/storage"
import {
  accountServiceMock,
  accountSharedServiceMock,
  emitterMock,
  getKeyValueStorage,
  getMultisigStoreMock,
  getPendingMultisigStoreMock,
  getSessionStoreMock,
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
  getSessionStoreMock(),
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
  getSessionStoreMock(),
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
