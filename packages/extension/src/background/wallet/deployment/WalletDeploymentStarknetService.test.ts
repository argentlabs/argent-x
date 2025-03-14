import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import urlJoin from "url-join"
import { Wallet } from ".."
import { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import {
  deserializeFactory,
  serialize,
} from "../../../shared/account/store/serialize"
import { ARGENT_API_BASE_URL } from "../../../shared/api/constants"
import { tryToMintAllFeeTokens } from "../../../shared/devnet/mintFeeToken"
import { SessionError } from "../../../shared/errors/session"
import type { PendingMultisig } from "../../../shared/multisig/types"
import { pendingMultisigEqual } from "../../../shared/multisig/utils/selectors"
import type { Network } from "../../../shared/network"
import { defaultNetwork, defaultNetworks } from "../../../shared/network"
import * as jwtService from "../../../shared/smartAccount/jwt"
import { ArrayStorage, KeyValueStorage } from "../../../shared/storage"
import type {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import { adaptKeyValue } from "../../../shared/storage/__new/keyvalue"
import { adaptArrayStorage } from "../../../shared/storage/__new/repository"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import type {
  BaseMultisigWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { WalletAccountStarknetService } from "../account/WalletAccountStarknetService"
import type { WalletStorageProps } from "../backup/WalletBackupService"
import { WalletBackupService } from "../backup/WalletBackupService"
import { WalletCryptoSharedService } from "../crypto/WalletCryptoSharedService"
import { WalletCryptoStarknetService } from "../crypto/WalletCryptoStarknetService"
import { WalletSessionService } from "../session/WalletSessionService"
import {
  analyticsServiceMock,
  getDefaultReferralService,
  recoverySharedServiceMock,
  recoveryStarknetServiceMock,
} from "../test.utils"
import type { INetworkService } from "../../../shared/network/service/INetworkService"
import { WalletDeploymentStarknetService } from "./WalletDeploymentStarknetService"
import { LedgerSharedService } from "../../../shared/ledger/service/LedgerSharedService"
import { stark } from "starknet"
import { AccountImportSharedService } from "../../../shared/accountImport/service/AccountImportSharedService"
import type { IPKStore } from "../../../shared/accountImport/types"
import { PKManager } from "../../../shared/accountImport/pkManager/PKManager"
import {
  accountServiceMock,
  emitterMock,
  httpServiceMock,
  multisigBackendServiceMock,
  smartAccountServiceMock,
} from "../../../shared/test.utils"
import type { ISessionStore } from "../../../shared/session/storage"
import SecretStorageService from "../session/secretStorageService"
import type { ISecureServiceSessionStore } from "../session/interface"

const networkService: Pick<INetworkService, "getById"> = {
  getById: async (networkId) => {
    return defaultNetworks.find((n) => n.id === networkId) as Network
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

const getPKStore = (name: string) => {
  return new KeyValueStorage<IPKStore>({ keystore: {} }, name)
}

const SCRYPT_N = 262144

const getWallet = (randId = Math.random()) => {
  const storage: IObjectStore<WalletStorageProps> = adaptKeyValue(
    new KeyValueStorage<WalletStorageProps>({}, `test:wallet:${randId}`),
  )
  const accountStore: IRepository<WalletAccount> = adaptArrayStorage(
    getAccountStore(`test:accounts:${randId}`),
  )
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

  const baseMultisigStore: IRepository<BaseMultisigWalletAccount> =
    adaptArrayStorage(getMultisigStore(`test:multisig:${randId}`))
  const pendingMultisigStore: IRepository<PendingMultisig> = adaptArrayStorage(
    getPendingMultisigStore(`test:multisig:pending:${randId}`),
  )

  const pkStore = adaptKeyValue(getPKStore(`test:pk:${randId}`))

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
  const ledgerService = new LedgerSharedService(
    networkService,
    multisigBackendServiceMock,
  )

  const pkManager = new PKManager(pkStore, SCRYPT_N)

  const importAccountService = new AccountImportSharedService(
    accountServiceMock,
    networkService,
    pkManager,
  )

  const defaultCryptoStarknetService = new WalletCryptoStarknetService(
    accountStore,
    mockSecretStorageService,
    pendingMultisigStore,
    defaultAccountSharedService,
    ledgerService,
    pkManager,
    vi.fn(),
  )

  const defaultSessionService = new WalletSessionService(
    emitterMock,
    storage,
    sessionStorage,
    mockSecretStorageService,
    defaultBackUpService,
    recoverySharedServiceMock,
    SCRYPT_N,
  )

  const defaultAccountStarknetService = new WalletAccountStarknetService(
    pendingMultisigStore,
    networkService,
    defaultSessionService,
    defaultAccountSharedService,
    defaultCryptoStarknetService,
    multisigBackendServiceMock,
    ledgerService,
    importAccountService,
    mockSecretStorageService,
  )

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
    analyticsServiceMock,
    getDefaultReferralService(),
  )

  const defaultCryptoSharedService = new WalletCryptoSharedService(
    mockSecretStorageService,
    defaultSessionService,
    defaultBackUpService,
    recoverySharedServiceMock,
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
    recoverySharedServiceMock,
    recoveryStarknetServiceMock,
    defaultSessionService,
  )

  return wallet
}

const address = stark.randomAddress()
const BASE_URL_ENDPOINT = urlJoin(ARGENT_API_BASE_URL, "account")
const addAccountJsonResponse = {
  address,
  guardianAddress: "0x234",
  account: {
    salt: "0x07a50e15dfdbef17a7607825b8e2ad15e5951b43505853325f4c199b0441a3f3",
  },
}

const server = setupServer(
  http.post(BASE_URL_ENDPOINT, () => {
    return HttpResponse.json(addAccountJsonResponse)
  }),
  http.get(BASE_URL_ENDPOINT, () => {
    return HttpResponse.json({ userId: "123" })
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("WalletDeploymentStarknetService", () => {
  let wallet: Wallet

  beforeEach(() => {
    wallet = getWallet()
  })

  describe("newAccount", () => {
    it("should throw error if no open session", async () => {
      await expect(
        wallet.newAccount(defaultNetwork.id, "standard"),
      ).rejects.toThrowError(new SessionError({ code: "NO_OPEN_SESSION" }))
    })

    it("should create a new standard account", async () => {
      const isValid = await wallet.startSession("my_secret_password")

      expect(isValid).toBe(true)
      expect(await wallet.isSessionOpen()).toBe(true)

      const account: WalletAccount = await wallet.newAccount(
        defaultNetwork.id,
        "standard",
      )
      void tryToMintAllFeeTokens(account, networkService)

      expect(account.needsDeploy).toBe(true)
      expect(account.type).toBe("standard")
      expect(account.networkId).toBe(defaultNetwork.id)
      expect(account.guardian).toBeUndefined()
    })

    describe("smart account", () => {
      vi.spyOn(httpServiceMock, "get").mockResolvedValue({ version: 0 })
      vi.spyOn(httpServiceMock, "put").mockResolvedValue({ version: 0 })
      vi.spyOn(jwtService, "generateJwt").mockResolvedValue("jwt")

      it.skip("should create a new smart account", async () => {
        const isValid = await wallet.startSession("my_secret_password")

        expect(isValid).toBe(true)
        expect(await wallet.isInitialized()).toBe(true)
        expect(await wallet.isSessionOpen()).toBe(true)

        const account: WalletAccount = await wallet.newAccount(
          defaultNetwork.id,
          "smart",
        )
        void tryToMintAllFeeTokens(account, networkService)

        expect(account.needsDeploy).toBe(true)
        expect(account.type).toBe("smart")
        expect(account.networkId).toBe(defaultNetwork.id)
        expect(account.guardian).toBeDefined()
        expect(account.guardian).toBe(addAccountJsonResponse.guardianAddress)
        expect(account.address).toBe(addAccountJsonResponse.address)
      })

      it.skip("should create two new smart accounts", async () => {
        const isValid = await wallet.startSession("my_secret_password")

        expect(isValid).toBe(true)
        expect(await wallet.isInitialized()).toBe(true)
        expect(await wallet.isSessionOpen()).toBe(true)

        const account1: WalletAccount = await wallet.newAccount(
          defaultNetwork.id,
          "smart",
        )

        // FIXME: since the POST response is the same both both accounts,
        // the second account overwrites the first in storage since they have the same address and network id
        // this results in Account 2 overwriting Account 1
        // so only 'Account 2' is selected

        // const account2: WalletAccount = await wallet.newAccount(
        //   defaultNetwork.id,
        //   "smart",
        // )

        void tryToMintAllFeeTokens(account1, networkService)
        // void tryToMintAllFeeTokens(account2, networkService)

        const selectedAccount = await wallet.getSelectedAccount()
        expect(selectedAccount?.name).toEqual(account1.name)

        expect(account1.type).toBe("smart")
        expect(account1.guardian).toBe(addAccountJsonResponse.guardianAddress)
        expect(account1.address).toBe(addAccountJsonResponse.address)

        // expect(account2.type).toBe("smart")
        // expect(account2.guardian).toBe(addAccountJsonResponse.guardianAddress)
        // expect(account2.address).toBe(addAccountJsonResponse.address)
      })
    })
  })
})
