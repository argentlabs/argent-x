/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { PendingMultisig } from "../../../shared/multisig/types"
import { pendingMultisigEqual } from "../../../shared/multisig/utils/selectors"
import {
  Network,
  defaultNetwork,
  defaultNetworks,
} from "../../../shared/network"
import * as jwtService from "../../../shared/smartAccount/jwt"
import {
  ArrayStorage,
  KeyValueStorage,
  ObjectStorage,
} from "../../../shared/storage"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import { adaptKeyValue } from "../../../shared/storage/__new/keyvalue"
import { adaptObjectStorage } from "../../../shared/storage/__new/object"
import { adaptArrayStorage } from "../../../shared/storage/__new/repository"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import {
  BaseMultisigWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { WalletAccountStarknetService } from "../account/WalletAccountStarknetService"
import {
  WalletBackupService,
  WalletStorageProps,
} from "../backup/WalletBackupService"
import { WalletCryptoSharedService } from "../crypto/WalletCryptoSharedService"
import { WalletCryptoStarknetService } from "../crypto/WalletCryptoStarknetService"
import { WalletSessionService } from "../session/WalletSessionService"
import { WalletSession } from "../session/walletSession.model"
import {
  accountServiceMock,
  analyticsServiceMock,
  emitterMock,
  getDefaultReferralService,
  httpServiceMock,
  multisigBackendServiceMock,
  recoverySharedServiceMock,
  recoveryStarknetServiceMock,
} from "../test.utils"
import { INetworkService } from "../../../shared/network/service/INetworkService"
import { WalletDeploymentStarknetService } from "./WalletDeploymentStarknetService"
import { LedgerSharedService } from "../../../shared/ledger/service/LedgerSharedService"

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

const getSessionStore = (name: string) => {
  return new ObjectStorage<WalletSession | null>(null, name)
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

const SCRYPT_N = 262144

const getWallet = (randId = Math.random()) => {
  const storage: IObjectStore<WalletStorageProps> = adaptKeyValue(
    new KeyValueStorage<WalletStorageProps>({}, `test:wallet:${randId}`),
  )
  const accountStore: IRepository<WalletAccount> = adaptArrayStorage(
    getAccountStore(`test:accounts:${randId}`),
  )
  const sessionStore: IObjectStore<WalletSession | null> = adaptObjectStorage(
    getSessionStore(`test:sessions:${randId}`),
  )
  const baseMultisigStore: IRepository<BaseMultisigWalletAccount> =
    adaptArrayStorage(getMultisigStore(`test:multisig:${randId}`))
  const pendingMultisigStore: IRepository<PendingMultisig> = adaptArrayStorage(
    getPendingMultisigStore(`test:multisig:pending:${randId}`),
  )

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
  const ledgerService = new LedgerSharedService(
    networkService,
    multisigBackendServiceMock,
  )

  const defaultCryptoStarknetService = new WalletCryptoStarknetService(
    accountStore,
    sessionStore,
    pendingMultisigStore,
    defaultAccountSharedService,
    ledgerService,
    vi.fn(),
  )

  const defaultSessionService = new WalletSessionService(
    emitterMock,
    storage,
    sessionStore,
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
  )

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
    analyticsServiceMock,
    getDefaultReferralService(),
  )

  const defaultCryptoSharedService = new WalletCryptoSharedService(
    sessionStore,
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

const address = "0x123"
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

      it("should create a new smart account", async () => {
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

      it("should create two new smart accounts", async () => {
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
        expect(selectedAccount?.name).toEqual("Account 1")

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
