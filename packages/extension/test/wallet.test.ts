import fs from "fs"
import path from "path"

import { IStorage } from "../src/background/storage"
import {
  SESSION_DURATION,
  Wallet,
  WalletStorageProps,
} from "../src/background/wallet"
import type { Network } from "../src/shared/networks"
import backupWrong from "./backup_wrong.mock.json"
import backup from "./backup.mock.json"

const backupString = JSON.stringify(backup)
const backupWrongString = JSON.stringify(backupWrong)

export class MockStorage implements IStorage<WalletStorageProps> {
  public store: WalletStorageProps = {}

  async getItem<K extends keyof WalletStorageProps>(
    key: K,
  ): Promise<WalletStorageProps[K]> {
    return Promise.resolve(this.store[key])
  }
  async setItem<K extends keyof WalletStorageProps>(
    key: K,
    value: WalletStorageProps[K],
  ): Promise<void> {
    this.store[key] = value
  }
}

const argentAccountCompiledContract = fs.readFileSync(
  path.join(__dirname, "../src/contracts/ArgentAccount.txt"),
  "utf8",
)

const proxyCompiledContract = fs.readFileSync(
  path.join(__dirname, "../src/contracts/Proxy.txt"),
  "utf8",
)

const REGEX_HEXSTRING = /^0x[a-fA-F0-9]+/i
const SESSION_DURATION_PLUS_ONE_SEC = SESSION_DURATION + 1000

const NETWORK = "testnetwork"
const getNetwork = async (): Promise<Network> => ({
  id: NETWORK,
  chainId: "SN_GOERLI",
  baseUrl: "http://localhost:5000",
  name: "Test Network",
})

jest.setTimeout(999999)

afterEach(() => {
  jest.useRealTimers()
})

test("create a new wallet", async () => {
  jest.useFakeTimers()

  const storage = new MockStorage()
  const wallet = new Wallet(
    storage,
    proxyCompiledContract,
    argentAccountCompiledContract,
    getNetwork,
  )
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  const isValid = await wallet.startSession("my_secret_password")

  expect(isValid).toBe(true)
  expect(wallet.isInitialized()).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)

  const backupWithoutAccount = await storage.getItem("backup")
  expect(backupWithoutAccount).toBeDefined()
  expect(Wallet.validateBackup(backupWithoutAccount as string)).toBe(true)

  const { txHash } = await wallet.addAccount(NETWORK)
  expect(txHash).toMatch(REGEX_HEXSTRING)

  const accounts = await wallet.getAccounts()
  expect(accounts).toHaveLength(1)

  const backupWithAccount = await storage.getItem("backup")
  expect(backupWithAccount).toBeDefined()
  expect(Wallet.validateBackup(backupWithAccount as string)).toBe(true)

  const selectedAccount = await wallet.getSelectedAccount()
  expect(selectedAccount).toBeDefined()

  jest.advanceTimersByTime(SESSION_DURATION_PLUS_ONE_SEC)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("open existing wallet", async () => {
  jest.useFakeTimers()

  const storage = new MockStorage()
  storage.setItem("backup", backupString)
  const wallet = new Wallet(
    storage,
    proxyCompiledContract,
    argentAccountCompiledContract,
    getNetwork,
  )
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_secret_password")
  expect(isValid).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)

  const accounts = await wallet.getAccounts()
  expect(accounts).toHaveLength(1)
  const account = accounts[0]
  expect(account.address).toBe(
    "0x06c67629cae87e7a1b284f1002747af681b39b8199f9263b9aed985e200d8f59",
  )

  const backupWithAccount = await storage.getItem("backup")
  expect(backupWithAccount).toBeDefined()
  expect(Wallet.validateBackup(backupWithAccount as string)).toBe(true)

  const selectedAccount = await wallet.getSelectedAccount()
  expect(selectedAccount).toBeDefined()
  expect(selectedAccount?.address).toBe(
    "0x06c67629cae87e7a1b284f1002747af681b39b8199f9263b9aed985e200d8f59",
  )

  jest.advanceTimersByTime(SESSION_DURATION_PLUS_ONE_SEC)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("open existing wallet with wrong password", async () => {
  const storage = new MockStorage()
  storage.setItem("backup", backupString)
  const wallet = new Wallet(
    storage,
    proxyCompiledContract,
    argentAccountCompiledContract,
    getNetwork,
  )
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_falsy_secret_password")
  expect(isValid).toBe(false)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("import backup file", async () => {
  jest.useFakeTimers()

  const storage = new MockStorage()
  const wallet = new Wallet(
    storage,
    proxyCompiledContract,
    argentAccountCompiledContract,
    getNetwork,
  )
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  await wallet.importBackup(backupString)

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_secret_password")
  expect(isValid).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)

  jest.advanceTimersByTime(SESSION_DURATION_PLUS_ONE_SEC)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("import wrong backup file", async () => {
  const storage = new MockStorage()
  const wallet = new Wallet(
    storage,
    proxyCompiledContract,
    argentAccountCompiledContract,
    getNetwork,
  )
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  await expect(wallet.importBackup(backupWrongString)).rejects.toThrow(
    "invalid backup file",
  )

  expect(wallet.isInitialized()).toBe(false)
})
