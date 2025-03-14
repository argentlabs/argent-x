import Emittery from "emittery"

import { accountRepo } from "../shared/account/store"
import {
  multisigBaseWalletRepo,
  pendingMultisigRepo,
} from "../shared/multisig/repository"
import { networkService } from "../shared/network/service"
import { walletStore } from "../shared/wallet/walletStore"
import { Wallet } from "./wallet"
import { WalletAccountStarknetService } from "./wallet/account/WalletAccountStarknetService"
import { WalletBackupService } from "./wallet/backup/WalletBackupService"
import { WalletCryptoSharedService } from "./wallet/crypto/WalletCryptoSharedService"
import { WalletCryptoStarknetService } from "./wallet/crypto/WalletCryptoStarknetService"
import { WalletDeploymentStarknetService } from "./wallet/deployment/WalletDeploymentStarknetService"
import { loadContracts } from "./wallet/loadContracts"
import { WalletRecoverySharedService } from "./wallet/recovery/WalletRecoverySharedService"
import { WalletRecoveryStarknetService } from "./wallet/recovery/WalletRecoveryStarknetService"
import type { Events as SessionEvents } from "./wallet/session/interface"
import { WalletSessionService } from "./wallet/session/WalletSessionService"
import { MultisigBackendService } from "../shared/multisig/service/backend/MultisigBackendService"
import { ARGENT_MULTISIG_URL } from "../shared/api/constants"
import type { Events as RecoverySharedEvents } from "./wallet/recovery/IWalletRecoveryService"
import { accountSharedService } from "../shared/account/service"
import { ampli } from "../shared/analytics"
import { referralService } from "./services/referral"
import { ledgerSharedService } from "../shared/ledger/service"
import { accountImportSharedService } from "../shared/accountImport/service"
import { pkManager } from "../shared/accountImport/pkManager"
import { sessionStore } from "../shared/session/storage"
import { secretStorageService } from "./wallet/session"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest
const SCRYPT_N = isDevOrTest ? 64 : 262144

export const walletSessionServiceEmitter = new Emittery<SessionEvents>()
export const walletRecoverySharedServiceEmitter =
  new Emittery<RecoverySharedEvents>()

export const multisigBackendService = new MultisigBackendService(
  ARGENT_MULTISIG_URL,
)

const backupService = new WalletBackupService(
  walletStore,
  accountRepo,
  networkService,
)

export const cryptoStarknetService = new WalletCryptoStarknetService(
  accountRepo,
  secretStorageService,
  pendingMultisigRepo,
  accountSharedService,
  ledgerSharedService,
  pkManager,
  loadContracts,
)

const recoveryStarknetService = new WalletRecoveryStarknetService(
  multisigBaseWalletRepo,
  multisigBackendService,
  ledgerSharedService,
  cryptoStarknetService,
  accountSharedService,
)

export const recoverySharedService = new WalletRecoverySharedService(
  walletRecoverySharedServiceEmitter,
  walletStore,
  accountRepo,
  secretStorageService,
  networkService,
  recoveryStarknetService,
)

export const sessionService = new WalletSessionService(
  walletSessionServiceEmitter,
  walletStore,
  sessionStore,
  secretStorageService,
  backupService,
  recoverySharedService,
  SCRYPT_N,
)

export const accountStarknetService = new WalletAccountStarknetService(
  pendingMultisigRepo,
  networkService,
  sessionService,
  accountSharedService,
  cryptoStarknetService,
  multisigBackendService,
  ledgerSharedService,
  accountImportSharedService,
  secretStorageService,
)

const deployStarknetService = new WalletDeploymentStarknetService(
  accountRepo,
  multisigBaseWalletRepo,
  sessionService,
  secretStorageService,
  accountSharedService,
  accountStarknetService,
  cryptoStarknetService,
  backupService,
  networkService,
  ampli,
  referralService,
)

const cryptoSharedService = new WalletCryptoSharedService(
  secretStorageService,
  sessionService,
  backupService,
  recoverySharedService,
  deployStarknetService,
  SCRYPT_N,
)

export const walletSingleton = new Wallet(
  accountSharedService,
  accountStarknetService,
  backupService,
  cryptoSharedService,
  cryptoStarknetService,
  deployStarknetService,
  recoverySharedService,
  recoveryStarknetService,
  sessionService,
)
