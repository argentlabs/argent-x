import fs from "fs"
import path from "path"

import { expect, test } from "vitest"

import { LoadContracts } from "../src/background/accounts"
import {
  GetNetwork,
  Wallet,
  WalletSession,
  WalletStorageProps,
} from "../src/background/wallet"
import { deserialize, serialize } from "../src/shared/account/serialize"
import { Network } from "../src/shared/network"
import {
  ArrayStorage,
  KeyValueStorage,
  ObjectStorage,
} from "../src/shared/storage"
import { WalletAccount } from "../src/shared/wallet.model"
import { accountsEqual } from "../src/shared/wallet.service"
import backupWrong from "./backup_wrong.mock.json"
import backup from "./backup.mock.json"

const backupString = JSON.stringify(backup)
const backupWrongString = JSON.stringify(backupWrong)

const argentAccountCompiledContract = fs.readFileSync(
  path.join(__dirname, "../src/contracts/ArgentAccount.txt"),
  "utf8",
)

const proxyCompiledContract = fs.readFileSync(
  path.join(__dirname, "../src/contracts/Proxy.txt"),
  "utf8",
)

const loadContracts: LoadContracts = async () => [
  proxyCompiledContract,
  argentAccountCompiledContract,
]

const getAccountStore = (name: string, defaults: WalletAccount[] = []) => {
  return new ArrayStorage<WalletAccount>(defaults, {
    namespace: name,
    compare: accountsEqual,
    serialize,
    deserialize,
  })
}

const getSessionStore = (name: string) => {
  return new ObjectStorage<WalletSession | null>(null, name)
}

const REGEX_HEXSTRING = /^0x[a-fA-F0-9]+/i

const NETWORK = "testnetwork"
// return a falsy value if network is not known. This is normally not allowed, but will skip the account discovery on the known networks (goerli and mainnet)
const getNetwork: GetNetwork = async (networkId) =>
  (networkId === NETWORK && {
    id: NETWORK,
    chainId: "SN_GOERLI",
    baseUrl: "http://127.0.0.1:5050/",
    name: "Test Network",
  }) as Network

describe("Wallet", () => {
  test("create a new wallet", async () => {
    const storage = new KeyValueStorage<WalletStorageProps>({}, "test:wallet1")
    const accountStore = getAccountStore("test:accounts1")
    const sessionStore = getSessionStore("test:sessions1")
    const wallet = new Wallet(
      storage,
      accountStore,
      sessionStore,
      loadContracts,
      getNetwork,
    )

    expect(await wallet.isInitialized()).toBe(false)

    const isValid = await wallet.startSession("my_secret_password")

    expect(isValid).toBe(true)
    expect(await wallet.isInitialized()).toBe(true)
    expect(await wallet.isSessionOpen()).toBe(true)

    const backupWithoutAccount = await storage.get("backup")
    expect(backupWithoutAccount).toBeDefined()
    expect(Wallet.validateBackup(backupWithoutAccount as string)).toBe(true)

    const account = await wallet.newAccount(NETWORK)

    const { txHash } = await wallet.deployAccount(account)

    expect(txHash).toMatch(REGEX_HEXSTRING)

    const accounts = await accountStore.get()
    expect(accounts).toHaveLength(1)

    const backupWithAccount = await storage.get("backup")
    expect(backupWithAccount).toBeDefined()
    expect(Wallet.validateBackup(backupWithAccount as string)).toBe(true)

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
        address: backup.argent.accounts[0].address,
        networkId: backup.argent.accounts[0].network,
        signer: {
          type: "local_secret",
          derivationPath: backup.argent.accounts[0].signer.derivationPath,
        },
        network: await getNetwork(backup.argent.accounts[0].network),
        type: "argent",
      },
    ])
    const sessionStore = getSessionStore("test:sessions2")

    const wallet = new Wallet(
      storage,
      accountStore,
      sessionStore,
      loadContracts,
      getNetwork,
    )

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
    expect(Wallet.validateBackup(backupWithAccount as string)).toBe(true)

    const selectedAccount = await wallet.getSelectedAccount()
    expect(selectedAccount).toBeDefined()
    expect(selectedAccount?.address).toBe(
      "0x06c67629cae87e7a1b284f1002747af681b39b8199f9263b9aed985e200d8f59",
    )

    await wallet.lock()
    expect(await wallet.isSessionOpen()).toBe(false)
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
    const sessionStore = getSessionStore("test:sessions3")

    const wallet = new Wallet(
      storage,
      accountStore,
      sessionStore,
      loadContracts,
      getNetwork,
    )

    expect(await wallet.isInitialized()).toBe(true)

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
    const sessionStore = getSessionStore("test:sessions4")

    const wallet = new Wallet(
      storage,
      accountStore,
      sessionStore,
      loadContracts,
      getNetwork,
    )

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
    const wallet = new Wallet(
      storage,
      accountStore,
      sessionStore,
      loadContracts,
      getNetwork,
    )

    expect(await wallet.isInitialized()).toBe(false)

    await expect(wallet.importBackup(backupWrongString)).rejects.toThrow(
      "invalid backup file",
    )

    expect(await wallet.isInitialized()).toBe(false)
  })
})
