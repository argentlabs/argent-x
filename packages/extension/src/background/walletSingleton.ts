import Emittery from "emittery"

import { accountRepo } from "../shared/account/store"
import {
  multisigBaseWalletRepo,
  pendingMultisigRepo,
} from "../shared/multisig/repository"
import { networkService } from "../shared/network/service"
import { walletStore } from "../shared/wallet/walletStore"
import { Wallet } from "./wallet"
import { WalletAccountStarknetService } from "./wallet/account/starknet.service"
import { WalletBackupService } from "./wallet/backup/backup.service"
import { WalletCryptoSharedService } from "./wallet/crypto/shared.service"
import { WalletCryptoStarknetService } from "./wallet/crypto/starknet.service"
import { WalletDeploymentStarknetService } from "./wallet/deployment/starknet.service"
import { loadContracts } from "./wallet/loadContracts"
import { WalletRecoverySharedService } from "./wallet/recovery/shared.service"
import { WalletRecoveryStarknetService } from "./wallet/recovery/starknet.service"
import { Events as SessionEvents } from "./wallet/session/interface"
import { WalletSessionService } from "./wallet/session/session.service"
import { MultisigBackendService } from "../shared/multisig/service/backend/implementation"
import { ARGENT_MULTISIG_URL } from "../shared/api/constants"
import { Events as RecoverySharedEvents } from "./wallet/recovery/interface"
import { accountSharedService } from "../shared/account/service"
import { sessionRepo } from "../shared/account/store/session"
import { analyticsService } from "../shared/analytics"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest
const SCRYPT_N = isDevOrTest ? 64 : 262144

export const walletSessionServiceEmitter = new Emittery<SessionEvents>()
export const walletRecoverySharedServiceEmitter =
  new Emittery<RecoverySharedEvents>()

const backupService = new WalletBackupService(
  walletStore,
  accountRepo,
  networkService,
)

export const cryptoStarknetService = new WalletCryptoStarknetService(
  accountRepo,
  sessionRepo,
  pendingMultisigRepo,
  accountSharedService,
  loadContracts,
)

const recoveryStarknetService = new WalletRecoveryStarknetService(
  accountRepo,
  multisigBaseWalletRepo,
  cryptoStarknetService,
  accountSharedService,
)

export const recoverySharedService = new WalletRecoverySharedService(
  walletRecoverySharedServiceEmitter,
  walletStore,
  accountRepo,
  sessionRepo,
  networkService,
  recoveryStarknetService,
)

export const sessionService = new WalletSessionService(
  walletSessionServiceEmitter,
  walletStore,
  sessionRepo,
  backupService,
  recoverySharedService,
  SCRYPT_N,
)

export const multisigBackendService = new MultisigBackendService(
  ARGENT_MULTISIG_URL,
)

const accountStarknetService = new WalletAccountStarknetService(
  pendingMultisigRepo,
  networkService,
  sessionService,
  accountSharedService,
  cryptoStarknetService,
  multisigBackendService,
)

const deployStarknetService = new WalletDeploymentStarknetService(
  accountRepo,
  multisigBaseWalletRepo,
  pendingMultisigRepo,
  sessionService,
  sessionRepo,
  accountSharedService,
  accountStarknetService,
  cryptoStarknetService,
  backupService,
  networkService,
  analyticsService,
)

const cryptoSharedService = new WalletCryptoSharedService(
  sessionRepo,
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
