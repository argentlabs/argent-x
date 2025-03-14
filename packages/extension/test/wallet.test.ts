import fs from "fs"
import path from "path"

import { expect, test } from "vitest"

import { Wallet } from "../src/background/wallet"
import { WalletAccountStarknetService } from "../src/background/wallet/account/WalletAccountStarknetService"
import { WalletBackupService } from "../src/background/wallet/backup/WalletBackupService"
import { WalletCryptoSharedService } from "../src/background/wallet/crypto/WalletCryptoSharedService"
import { WalletCryptoStarknetService } from "../src/background/wallet/crypto/WalletCryptoStarknetService"
import { WalletDeploymentStarknetService } from "../src/background/wallet/deployment/WalletDeploymentStarknetService"
import type { LoadContracts } from "../src/background/wallet/loadContracts"
import { WalletRecoverySharedService } from "../src/background/wallet/recovery/WalletRecoverySharedService"
import { WalletRecoveryStarknetService } from "../src/background/wallet/recovery/WalletRecoveryStarknetService"
import { Locked } from "../src/background/wallet/session/interface"
import { WalletSessionService } from "../src/background/wallet/session/WalletSessionService"
import { WalletAccountSharedService } from "../src/shared/account/service/accountSharedService/WalletAccountSharedService"
import {
  deserializeFactory,
  serialize,
} from "../src/shared/account/store/serialize"
import { AnalyticsService } from "../src/shared/analytics/AnalyticsService"
import { tryToMintAllFeeTokens } from "../src/shared/devnet/mintFeeToken"
import { WalletError } from "../src/shared/errors/wallet"
import { MultisigBackendService } from "../src/shared/multisig/service/backend/MultisigBackendService"
import type { PendingMultisig } from "../src/shared/multisig/types"
import { pendingMultisigEqual } from "../src/shared/multisig/utils/selectors"
import type { Network } from "../src/shared/network"
import type { INetworkService } from "../src/shared/network/service/INetworkService"
import type { ISettingsStorage } from "../src/shared/settings/types"
import type { IKeyValueStorage } from "../src/shared/storage"
import { ArrayStorage, KeyValueStorage } from "../src/shared/storage"
import type {
  IObjectStore,
  IRepository,
} from "../src/shared/storage/__new/interface"
import { adaptKeyValue } from "../src/shared/storage/__new/keyvalue"
import { adaptArrayStorage } from "../src/shared/storage/__new/repository"
import { accountsEqual } from "../src/shared/utils/accountsEqual"
import type {
  BaseMultisigWalletAccount,
  WalletAccount,
} from "../src/shared/wallet.model"
import { SignerType } from "../src/shared/wallet.model"
import type { WalletStorageProps } from "../src/shared/wallet/walletStore"
import backup from "./backup.mock.json"
import backupWrong from "./backup_wrong.mock.json"

import type { IReferralService } from "../src/background/services/referral/IReferralService"
import { PKManager } from "../src/shared/accountImport/pkManager/PKManager"
import { AccountImportSharedService } from "../src/shared/accountImport/service/AccountImportSharedService"
import type { IPKStore } from "../src/shared/accountImport/types"
import { LedgerSharedService } from "../src/shared/ledger/service/LedgerSharedService"
import {
  accountServiceMock,
  emitterMock,
  httpServiceMock,
  ledgerServiceMock,
  multisigBackendServiceMock,
  smartAccountServiceMock,
} from "../src/shared/test.utils"
import { getAccountIdentifier } from "../src/shared/utils/accountIdentifier"
import { getMockSigner } from "./signer.mock"

import type { ISessionStore } from "../src/shared/session/storage"
import SecretStorageService from "../src/background/wallet/session/secretStorageService"
import type {
  ISecretStorageService,
  ISecureServiceSessionStore,
} from "../src/background/wallet/session/interface"

const backupString = JSON.stringify(backup)
const backupWrongString = JSON.stringify(backupWrong)

const argentAccountCompiledContract = fs.readFileSync(
  path.join(__dirname, "../src/contracts/ArgentAccount.txt"),
  "utf8",
)

const argentAccountCasm = fs.readFileSync(
  path.join(__dirname, "../src/contracts/ArgentAccount.casm.txt"),
  "utf8",
)

const loadContracts: LoadContracts = async () => [
  argentAccountCompiledContract,
  argentAccountCasm,
]

const NETWORK = "localhost"
const devnetHost = process.env.DEVNET_HOST || "localhost"
const networkService: Pick<INetworkService, "getById"> = {
  // return a falsy value if network is not known. This is normally not allowed, but will skip the account discovery on the known networks (goerli and mainnet)
  getById: async (networkId) => {
    return (networkId === NETWORK && {
      id: NETWORK,
      chainId: "SN_SEPOLIA",
      rpcUrl: `http://${devnetHost}:5050`,
      name: "Test Network",
    }) as Network
  },
}

const getAccountStore = (name: string, defaults: WalletAccount[] = []) => {
  return new ArrayStorage<WalletAccount>(defaults, {
    namespace: name,
    compare: accountsEqual,
    serialize,
    deserialize: deserializeFactory(
      networkService.getById.bind(networkService),
    ),
  })
}

const getSettingsStore = (name: string) => {
  return new KeyValueStorage<ISettingsStorage>({} as ISettingsStorage, name)
}

const getPKStore = (name: string) => {
  return new KeyValueStorage<IPKStore>({} as IPKStore, name)
}

const getMultisigStore = (
  name: string,
  defaults: BaseMultisigWalletAccount[] = [],
) => {
  return new ArrayStorage<BaseMultisigWalletAccount>(defaults, {
    namespace: name,
    compare: accountsEqual,
  })
}
const getPendingMultisigStore = (
  name: string,
  defaults: PendingMultisig[] = [],
) => {
  return new ArrayStorage<PendingMultisig>(defaults, {
    namespace: name,
    compare: pendingMultisigEqual,
  })
}

const REGEX_HEXSTRING = /^0x[a-fA-F0-9]+/i

const SCRYPT_N = 262144

const getWallet = ({
  storage,
  accountStore,
  sessionStorage,
  baseMultisigStore,
  pendingMultisigStore,
  pkStore,
  secretStorageService,
}: {
  storage: IObjectStore<WalletStorageProps>
  accountStore: IRepository<WalletAccount>
  sessionStorage: IKeyValueStorage<ISessionStore>
  baseMultisigStore: IRepository<BaseMultisigWalletAccount>
  pendingMultisigStore: IRepository<PendingMultisig>
  pkStore: IObjectStore<IPKStore>
  secretStorageService?: ISecretStorageService
}) => {
  let mockSecretStorageService = secretStorageService

  if (!mockSecretStorageService) {
    const sessionStore = new KeyValueStorage<ISecureServiceSessionStore>(
      { exportedKey: "", salt: "", vault: "" },
      "test:sessionStore",
    )
    mockSecretStorageService = new SecretStorageService(sessionStore)
  }

  const defaultBackUpService = new WalletBackupService(
    storage,
    accountStore,
    networkService,
  )

  const defaultAccountSharedService = new WalletAccountSharedService(
    storage,
    accountStore,
    sessionStorage,
    baseMultisigStore,
    pendingMultisigStore,
    httpServiceMock,
    accountServiceMock,
    smartAccountServiceMock,
  )

  const defaultAnalyticsService = new AnalyticsService(
    defaultAccountSharedService,
    getSettingsStore(""),
  )

  const defaultLedgerService = new LedgerSharedService(
    networkService,
    multisigBackendServiceMock,
  )

  const defaultPKManager = new PKManager(pkStore, 1024)

  const defaultImportAccountService = new AccountImportSharedService(
    accountServiceMock,
    networkService,
    defaultPKManager,
  )

  const defaultCryptoStarknetService = new WalletCryptoStarknetService(
    accountStore,
    mockSecretStorageService,
    pendingMultisigStore,
    defaultAccountSharedService,
    defaultLedgerService,
    defaultPKManager,
    loadContracts,
  )

  const defaultRecoveryStarknetService = new WalletRecoveryStarknetService(
    baseMultisigStore,
    multisigBackendServiceMock,
    ledgerServiceMock,
    defaultCryptoStarknetService,
    defaultAccountSharedService,
  )

  const defaultRecoverySharedService = new WalletRecoverySharedService(
    emitterMock,
    storage,
    accountStore,
    mockSecretStorageService,
    networkService,
    defaultRecoveryStarknetService,
  )

  const defaultSessionService = new WalletSessionService(
    emitterMock,
    storage,
    sessionStorage,
    mockSecretStorageService,
    defaultBackUpService,
    defaultRecoverySharedService,
    SCRYPT_N,
  )

  const defaultMultisigBackendService = new MultisigBackendService(
    "mockBackendUrl",
  )

  const defaultAccountStarknetService = new WalletAccountStarknetService(
    pendingMultisigStore,
    networkService,
    defaultSessionService,
    defaultAccountSharedService,
    defaultCryptoStarknetService,
    defaultMultisigBackendService,
    defaultLedgerService,
    defaultImportAccountService,
    mockSecretStorageService,
  )

  const defaultReferralService = (): IReferralService => {
    return { trackReferral: () => Promise.resolve() }
  }

  const defaultDeployStarknetService = new WalletDeploymentStarknetService(
    accountStore,
    baseMultisigStore,
    defaultSessionService,
    mockSecretStorageService,
    defaultAccountSharedService,
    defaultAccountStarknetService,
    defaultCryptoStarknetService,
    defaultBackUpService,
    networkService,
    defaultAnalyticsService,
    defaultReferralService(),
  )

  const defaultCryptoSharedService = new WalletCryptoSharedService(
    mockSecretStorageService,
    defaultSessionService,
    defaultBackUpService,
    defaultRecoverySharedService,
    defaultDeployStarknetService,
    SCRYPT_N,
  )

  const wallet = new Wallet(
    defaultAccountSharedService,
    defaultAccountStarknetService,
    defaultBackUpService,
    defaultCryptoSharedService,
    defaultCryptoStarknetService,
    defaultDeployStarknetService,
    defaultRecoverySharedService,
    defaultRecoveryStarknetService,
    defaultSessionService,
  )
  return wallet
}

describe("Wallet", () => {
  test("create a new wallet", async () => {
    const storage = new KeyValueStorage<WalletStorageProps>({}, "test:wallet1")
    const sessionStorage = new KeyValueStorage<ISessionStore>(
      {
        isUnlocked: false,
      },
      "test:wallet",
    )
    const accountStore = getAccountStore("test:accounts1")
    const baseMultisigStore = getMultisigStore("test:multisig1")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending1",
    )
    const pkStore = getPKStore("test:pk1")

    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStorage,
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
      pkStore: adaptKeyValue(pkStore),
    })
    expect(await wallet.isInitialized()).toBe(false)

    const isValid = await wallet.startSession("my_secret_password")

    expect(isValid).toBe(true)
    expect(await wallet.isInitialized()).toBe(true)
    expect(await wallet.isSessionOpen()).toBe(true)
    expect(emitterMock.emit).toHaveBeenLastCalledWith(Locked, false)

    const backupWithoutAccount = await storage.get("backup")
    expect(backupWithoutAccount).toBeDefined()
    expect(
      WalletBackupService.validateBackup(backupWithoutAccount as string),
    ).toBe(true)

    const account = await wallet.newAccount(NETWORK, "standard")
    await tryToMintAllFeeTokens(account, networkService)
    const { txHash } = await wallet.deployAccount(account)

    expect(txHash).toMatch(REGEX_HEXSTRING)

    const accounts = await accountStore.get()
    expect(accounts).toHaveLength(1)

    const backupWithAccount = await storage.get("backup")
    expect(backupWithAccount).toBeDefined()
    expect(
      WalletBackupService.validateBackup(backupWithAccount as string),
    ).toBe(true)

    const selectedAccount = await wallet.getSelectedAccount()
    expect(selectedAccount).toBeDefined()
  })

  test("open existing wallet and lock", async () => {
    const storage = new KeyValueStorage<WalletStorageProps>(
      {
        backup: backupString,
        discoveredOnce: true,
      },
      "test:wallet2",
    )
    const accountStore = getAccountStore("test:accounts2", [
      {
        id: getAccountIdentifier(
          backup.argent.accounts[0].address,
          backup.argent.accounts[0].network,
          getMockSigner(),
        ),
        name: backup.argent.accounts[0].name,
        address: backup.argent.accounts[0].address,
        networkId: backup.argent.accounts[0].network,
        signer: {
          type: SignerType.LOCAL_SECRET,
          derivationPath: backup.argent.accounts[0].signer.derivationPath,
        },
        network: await networkService.getById(
          backup.argent.accounts[0].network,
        ),
        type: "standard",
      },
    ])
    const baseMultisigStore = getMultisigStore("test:multisig2")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending2",
    )
    const pkStore = getPKStore("test:pk2")

    const sessionStorage = new KeyValueStorage<ISessionStore>(
      {
        isUnlocked: false,
      },
      "test:wallet",
    )

    emitterMock.emit.mockClear()

    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStorage,
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
      pkStore: adaptKeyValue(pkStore),
    })
    const isInitialized = await wallet.isInitialized()
    expect(isInitialized).toBe(true)

    const isValid = await wallet.startSession("my_secret_password")

    expect(isValid).toBe(true)
    expect(await wallet.isSessionOpen()).toBe(true)

    const accounts = await accountStore.get()
    expect(accounts).toHaveLength(1)
    const account = accounts[0]
    expect(account.address).toBe(
      "0x06c67629cae87e7a1b284f1002747af681b39b8199f9263b9aed985e200d8f59",
    )

    const backupWithAccount = await storage.get("backup")
    expect(backupWithAccount).toBeDefined()
    expect(
      WalletBackupService.validateBackup(backupWithAccount as string),
    ).toBe(true)

    const selectedAccount = await wallet.getSelectedAccount()
    expect(selectedAccount).toBeDefined()
    expect(selectedAccount?.address).toBe(
      "0x06c67629cae87e7a1b284f1002747af681b39b8199f9263b9aed985e200d8f59",
    )

    emitterMock.emit.mockClear()

    await wallet.lock()
    expect(await wallet.isSessionOpen()).toBe(false)
    expect(emitterMock.emit).toHaveBeenLastCalledWith(Locked, true)
  })

  test("open existing wallet with wrong password", async () => {
    const storage = new KeyValueStorage<WalletStorageProps>(
      {
        backup: backupString,
        discoveredOnce: true,
      },
      "test:wallet3",
    )
    const accountStore = getAccountStore("test:accounts3")
    const baseMultisigStore = getMultisigStore("test:multisig3")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending3",
    )
    const pkStore = getPKStore("test:pk3")

    const sessionStorage = new KeyValueStorage<ISessionStore>(
      {
        isUnlocked: false,
      },
      "test:wallet",
    )

    const sessionStore = new KeyValueStorage<ISecureServiceSessionStore>(
      { exportedKey: "", salt: "", vault: "" },
      "test:sessionStore",
    )
    const mockSecretStorageService = new SecretStorageService(sessionStore)

    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStorage,
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
      pkStore: adaptKeyValue(pkStore),
      secretStorageService: mockSecretStorageService,
    })

    expect(await wallet.isInitialized()).toBe(true)

    mockSecretStorageService.decrypt = vi.fn().mockResolvedValue(null)

    const isValid = await wallet.startSession("my_falsy_secret_password")
    expect(isValid).toBe(false)
    expect(await wallet.isSessionOpen()).toBe(false)
  })

  test("import backup file", async () => {
    const storage = new KeyValueStorage<WalletStorageProps>(
      {
        discoveredOnce: true,
      },
      "test:wallet4",
    )
    const accountStore = getAccountStore("test:accounts4")
    const baseMultisigStore = getMultisigStore("test:multisig4")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending4",
    )
    const pkStore = getPKStore("test:pk4")

    const sessionStorage = new KeyValueStorage<ISessionStore>(
      {
        isUnlocked: false,
      },
      "test:wallet",
    )

    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStorage,
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
      pkStore: adaptKeyValue(pkStore),
    })

    expect(await wallet.isInitialized()).toBe(false)

    await wallet.importBackup(backupString)

    expect(await wallet.isInitialized()).toBe(true)

    const isValid = await wallet.startSession("my_secret_password")
    expect(isValid).toBe(true)
    expect(await wallet.isSessionOpen()).toBe(true)
  })

  test("import wrong backup file", async () => {
    const storage = new KeyValueStorage<WalletStorageProps>(
      {
        discoveredOnce: true,
      },
      "test:wallet5",
    )
    const accountStore = getAccountStore("test:accounts5")
    const baseMultisigStore = getMultisigStore("test:multisig5")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending5",
    )
    const pkStore = getPKStore("test:pk4")

    const sessionStorage = new KeyValueStorage<ISessionStore>(
      {
        isUnlocked: false,
      },
      "test:wallet",
    )

    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStorage,
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
      pkStore: adaptKeyValue(pkStore),
    })

    expect(await wallet.isInitialized()).toBe(false)

    await expect(wallet.importBackup(backupWrongString)).rejects.toThrow(
      new WalletError({ code: "INVALID_BACKUP_FILE" }),
    )

    expect(await wallet.isInitialized()).toBe(false)
  })
})
