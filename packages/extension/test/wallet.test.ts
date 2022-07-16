import fs from "fs"
import path from "path"

import { afterEach, expect, test, vi } from "vitest"

import { LoadContracts } from "../src/background/accounts"
import {
  GetNetwork,
  SESSION_DURATION,
  Wallet,
  WalletStorageProps,
} from "../src/background/wallet"
import { deserialize, serialize } from "../src/shared/account/serialize"
import { Network } from "../src/shared/network"
import { ArrayStorage, KeyValueStorage } from "../src/shared/storage"
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

const getAccountStore = (name: string) => {
  return new ArrayStorage<WalletAccount>([], {
    namespace: name,
    compare: accountsEqual,
    serialize,
    deserialize,
  })
}

const REGEX_HEXSTRING = /^0x[a-fA-F0-9]+/i
const SESSION_DURATION_PLUS_ONE_SEC = SESSION_DURATION + 1000

const NETWORK = "testnetwork"
// return a falsy value if network is not known. This is normally not allowed, but will skip the account discovery on the known networks (goerli and mainnet)
const getNetwork: GetNetwork = async (networkId) =>
  (networkId === NETWORK && {
    id: NETWORK,
    chainId: "SN_GOERLI",
    baseUrl: "http://127.0.0.1:5050/",
    name: "Test Network",
  }) as Network

afterEach(() => {
  vi.useRealTimers()
})

test("create a new wallet", async () => {
  vi.useFakeTimers()

  const storage = new KeyValueStorage<WalletStorageProps>({}, "test:wallet1")
  const accountStore = getAccountStore("test:accounts1")
  const wallet = new Wallet(storage, accountStore, loadContracts, getNetwork)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  const isValid = await wallet.startSession("my_secret_password")

  expect(isValid).toBe(true)
  expect(wallet.isInitialized()).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)

  const backupWithoutAccount = await storage.get("backup")
  expect(backupWithoutAccount).toBeDefined()
  expect(Wallet.validateBackup(backupWithoutAccount as string)).toBe(true)

  const { txHash } = await wallet.addAccount(NETWORK)
  expect(txHash).toMatch(REGEX_HEXSTRING)

  const accounts = await accountStore.get()
  expect(accounts).toHaveLength(1)

  const backupWithAccount = await storage.get("backup")
  expect(backupWithAccount).toBeDefined()
  expect(Wallet.validateBackup(backupWithAccount as string)).toBe(true)

  const selectedAccount = await wallet.getSelectedAccount()
  expect(selectedAccount).toBeDefined()

  vi.advanceTimersByTime(SESSION_DURATION_PLUS_ONE_SEC)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("open existing wallet", async () => {
  vi.useFakeTimers()

  const storage = new KeyValueStorage<WalletStorageProps>({}, "test:wallet2")
  const accountStore = getAccountStore("test:accounts2")

  storage.set("backup", backupString)
  storage.set("discoveredOnce", true)
  const wallet = new Wallet(storage, accountStore, loadContracts, getNetwork)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_secret_password")
  expect(isValid).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)

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

  vi.advanceTimersByTime(SESSION_DURATION_PLUS_ONE_SEC)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("open existing wallet with wrong password", async () => {
  const storage = new KeyValueStorage<WalletStorageProps>({}, "test:wallet3")
  const accountStore = getAccountStore("test:accounts3")

  storage.set("backup", backupString)
  storage.set("discoveredOnce", true)
  const wallet = new Wallet(storage, accountStore, loadContracts, getNetwork)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_falsy_secret_password")
  expect(isValid).toBe(false)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("import backup file", async () => {
  vi.useFakeTimers()

  const storage = new KeyValueStorage<WalletStorageProps>({}, "test:wallet4")
  const accountStore = getAccountStore("test:accounts4")

  storage.set("discoveredOnce", true)
  const wallet = new Wallet(storage, accountStore, loadContracts, getNetwork)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  await wallet.importBackup(backupString)

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_secret_password")
  expect(isValid).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)

  vi.advanceTimersByTime(SESSION_DURATION_PLUS_ONE_SEC)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("import wrong backup file", async () => {
  const storage = new KeyValueStorage<WalletStorageProps>({}, "test:wallet5")
  const accountStore = getAccountStore("test:accounts5")
  const wallet = new Wallet(storage, accountStore, loadContracts, getNetwork)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  await expect(wallet.importBackup(backupWrongString)).rejects.toThrow(
    "invalid backup file",
  )

  expect(wallet.isInitialized()).toBe(false)
})
