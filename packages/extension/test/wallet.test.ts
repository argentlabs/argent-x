import fs from "fs"
import path from "path"

import { expect, test } from "vitest"

import { Wallet } from "../src/background/wallet"
import { WalletAccountStarknetService } from "../src/background/wallet/account/WalletAccountStarknetService"
import { WalletBackupService } from "../src/background/wallet/backup/WalletBackupService"
import { WalletCryptoSharedService } from "../src/background/wallet/crypto/WalletCryptoSharedService"
import { WalletCryptoStarknetService } from "../src/background/wallet/crypto/WalletCryptoStarknetService"
import { WalletDeploymentStarknetService } from "../src/background/wallet/deployment/WalletDeploymentStarknetService"
import { LoadContracts } from "../src/background/wallet/loadContracts"
import { WalletRecoverySharedService } from "../src/background/wallet/recovery/WalletRecoverySharedService"
import { WalletRecoveryStarknetService } from "../src/background/wallet/recovery/WalletRecoveryStarknetService"
import { Locked } from "../src/background/wallet/session/interface"
import { WalletSessionService } from "../src/background/wallet/session/WalletSessionService"
import { WalletSession } from "../src/background/wallet/session/walletSession.model"
import {
  accountServiceMock,
  emitterMock,
  httpServiceMock,
  ledgerServiceMock,
  multisigBackendServiceMock,
} from "../src/background/wallet/test.utils"
import { WalletAccountSharedService } from "../src/shared/account/service/accountSharedService/WalletAccountSharedService"
import {
  deserializeFactory,
  serialize,
} from "../src/shared/account/store/serialize"
import { AnalyticsService } from "../src/shared/analytics/AnalyticsService"
import { tryToMintAllFeeTokens } from "../src/shared/devnet/mintFeeToken"
import { WalletError } from "../src/shared/errors/wallet"
import { MultisigBackendService } from "../src/shared/multisig/service/backend/MultisigBackendService"
import { PendingMultisig } from "../src/shared/multisig/types"
import { pendingMultisigEqual } from "../src/shared/multisig/utils/selectors"
import { Network } from "../src/shared/network"
import { INetworkService } from "../src/shared/network/service/INetworkService"
import { ISettingsStorage } from "../src/shared/settings/types"
import {
  ArrayStorage,
  KeyValueStorage,
  ObjectStorage,
} from "../src/shared/storage"
import {
  IObjectStore,
  IRepository,
} from "../src/shared/storage/__new/interface"
import { adaptKeyValue } from "../src/shared/storage/__new/keyvalue"
import { adaptObjectStorage } from "../src/shared/storage/__new/object"
import { adaptArrayStorage } from "../src/shared/storage/__new/repository"
import { accountsEqual } from "../src/shared/utils/accountsEqual"
import {
  BaseMultisigWalletAccount,
  SignerType,
  WalletAccount,
} from "../src/shared/wallet.model"
import { WalletStorageProps } from "../src/shared/wallet/walletStore"
import backup from "./backup.mock.json"
import backupWrong from "./backup_wrong.mock.json"

import { IReferralService } from "../src/background/services/referral/IReferralService"
import { LedgerSharedService } from "../src/shared/ledger/service/LedgerSharedService"

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

const NETWORK = "testnetwork"
const networkService: Pick<INetworkService, "getById"> = {
  // return a falsy value if network is not known. This is normally not allowed, but will skip the account discovery on the known networks (goerli and mainnet)
  getById: async (networkId) => {
    return (networkId === NETWORK && {
      id: NETWORK,
      chainId: "SN_SEPOLIA",
      rpcUrl: "http://127.0.0.1:5050",
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

const getSessionStore = (name: string) => {
  return new ObjectStorage<WalletSession | null>(null, name)
}
const getSettingsStore = (name: string) => {
  return new KeyValueStorage<ISettingsStorage>({} as ISettingsStorage, name)
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
  sessionStore,
  baseMultisigStore,
  pendingMultisigStore,
}: {
  storage: IObjectStore<WalletStorageProps>
  accountStore: IRepository<WalletAccount>
  sessionStore: IObjectStore<WalletSession | null>
  baseMultisigStore: IRepository<BaseMultisigWalletAccount>
  pendingMultisigStore: IRepository<PendingMultisig>
}) => {
  const defaultBackUpService = new WalletBackupService(
    storage,
    accountStore,
    networkService,
  )

  const defaultAccountSharedService = new WalletAccountSharedService(
    storage,
    accountStore,
    sessionStore,
    baseMultisigStore,
    pendingMultisigStore,
    httpServiceMock,
    accountServiceMock,
  )

  const defaultAnalyticsService = new AnalyticsService(
    defaultAccountSharedService,
    getSettingsStore(""),
  )

  const defaultLedgerService = new LedgerSharedService(
    networkService,
    multisigBackendServiceMock,
  )

  const defaultCryptoStarknetService = new WalletCryptoStarknetService(
    accountStore,
    sessionStore,
    pendingMultisigStore,
    defaultAccountSharedService,
    defaultLedgerService,
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
    sessionStore,
    networkService,
    defaultRecoveryStarknetService,
  )

  const defaultSessionService = new WalletSessionService(
    emitterMock,
    storage,
    sessionStore,
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
  )

  const defaultReferralService = (): IReferralService => {
    return { trackReferral: () => Promise.resolve() }
  }

  const defaultDeployStarknetService = new WalletDeploymentStarknetService(
    accountStore,
    baseMultisigStore,
    pendingMultisigStore,
    defaultSessionService,
    sessionStore,
    defaultAccountSharedService,
    defaultAccountStarknetService,
    defaultCryptoStarknetService,
    defaultBackUpService,
    networkService,
    defaultAnalyticsService,
    defaultReferralService(),
  )

  const defaultCryptoSharedService = new WalletCryptoSharedService(
    sessionStore,
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
  // Skipped for now until devnet supports SN_SEPOLIA chain id
  test("create a new wallet", async () => {
    const storage = new KeyValueStorage<WalletStorageProps>({}, "test:wallet1")
    const accountStore = getAccountStore("test:accounts1")
    const sessionStore = getSessionStore("test:sessions1")
    const baseMultisigStore = getMultisigStore("test:multisig1")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending1",
    )

    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStore: adaptObjectStorage(sessionStore),
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
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
    void tryToMintAllFeeTokens(account, networkService)
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
    const sessionStore = getSessionStore("test:sessions2")
    const baseMultisigStore = getMultisigStore("test:multisig2")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending2",
    )

    emitterMock.emit.mockClear()

    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStore: adaptObjectStorage(sessionStore),
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
    })
    const isInitialized = await wallet.isInitialized()
    expect(isInitialized).toBe(true)

    const isValid = await wallet.startSession("my_secret_password")

    expect(isValid).toBe(true)
    expect(await wallet.isSessionOpen()).toBe(true)
    expect(emitterMock.emit).toHaveBeenLastCalledWith(Locked, false)

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
    emitterMock.emit.mockClear()
    const storage = new KeyValueStorage<WalletStorageProps>(
      {
        backup: backupString,
        discoveredOnce: true,
      },
      "test:wallet3",
    )
    const accountStore = getAccountStore("test:accounts3")
    const sessionStore = getSessionStore("test:sessions3")
    const baseMultisigStore = getMultisigStore("test:multisig3")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending3",
    )
    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStore: adaptObjectStorage(sessionStore),
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
    })

    expect(await wallet.isInitialized()).toBe(true)

    const isValid = await wallet.startSession("my_falsy_secret_password")
    expect(isValid).toBe(false)
    expect(await wallet.isSessionOpen()).toBe(false)
    expect(emitterMock.emit).not.toHaveBeenCalled()
  })

  test("import backup file", async () => {
    const storage = new KeyValueStorage<WalletStorageProps>(
      {
        discoveredOnce: true,
      },
      "test:wallet4",
    )
    const accountStore = getAccountStore("test:accounts4")
    const sessionStore = getSessionStore("test:sessions4")
    const baseMultisigStore = getMultisigStore("test:multisig4")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending4",
    )
    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStore: adaptObjectStorage(sessionStore),
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
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
    const sessionStore = getSessionStore("test:sessions5")
    const baseMultisigStore = getMultisigStore("test:multisig5")
    const pendingMultisigStore = getPendingMultisigStore(
      "test:multisig:pending5",
    )
    const wallet = getWallet({
      storage: adaptKeyValue(storage),
      accountStore: adaptArrayStorage(accountStore),
      sessionStore: adaptObjectStorage(sessionStore),
      baseMultisigStore: adaptArrayStorage(baseMultisigStore),
      pendingMultisigStore: adaptArrayStorage(pendingMultisigStore),
    })

    expect(await wallet.isInitialized()).toBe(false)

    await expect(wallet.importBackup(backupWrongString)).rejects.toThrow(
      new WalletError({ code: "INVALID_BACKUP_FILE" }),
    )

    expect(await wallet.isInitialized()).toBe(false)
  })
})
