import fs from "fs"
import path from "path"

import { matchers } from "jest-json-schema"

import { IStorage } from "../src/background/interfaces"
import { Wallet, WalletStorageProps } from "../src/background/wallet"

expect.extend(matchers)

export class MockStorage implements IStorage<WalletStorageProps> {
  public store: WalletStorageProps = {}

  async getItem(key: keyof WalletStorageProps): Promise<string | undefined> {
    return Promise.resolve(this.store[key] || undefined)
  }
  async setItem(key: keyof WalletStorageProps, value: string): Promise<void> {
    this.store[key] = value
    return Promise.resolve()
  }
}

const compiledContract = fs.readFileSync(
  path.join(__dirname, "../src/contracts/ArgentAccount.txt"),
  "utf8",
)

const backupSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./backup.schema.json"), "utf8"),
)

const backupString = fs.readFileSync(
  path.join(__dirname, "./backup.mock.json"),
  "utf8",
)

const backupWrongString = fs.readFileSync(
  path.join(__dirname, "./backup_wrong.mock.json"),
  "utf8",
)

const REGEX_HEXSTRING = /^0x[a-fA-F0-9]+/i

const NETWORK = "http://localhost:5000" // "goerli-alpha"

jest.setTimeout(999999)

test("create a new wallet", async () => {
  const storage = new MockStorage()
  const wallet = new Wallet(storage, compiledContract)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  const isValid = await wallet.startSession("my_secret_password")

  expect(isValid).toBe(true)
  expect(wallet.isInitialized()).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)

  const backupWithoutAccount = await storage.getItem("BACKUP")
  expect(backupWithoutAccount).toBeDefined()
  expect(JSON.parse(backupWithoutAccount as string)).toMatchSchema(backupSchema)

  const { txHash } = await wallet.addAccount(NETWORK)
  expect(txHash).toMatch(REGEX_HEXSTRING)

  const accounts = wallet.getAccounts()
  expect(accounts).toHaveLength(1)

  const backupWithAccount = await storage.getItem("BACKUP")
  expect(backupWithAccount).toBeDefined()
  expect(JSON.parse(backupWithAccount as string)).toMatchSchema(backupSchema)

  const selectedAccount = await wallet.getSelectedAccount()
  expect(selectedAccount).toBeDefined()
})

test("open existing wallet", async () => {
  const storage = new MockStorage()
  storage.setItem("BACKUP", backupString)
  const wallet = new Wallet(storage, compiledContract)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_secret_password")
  expect(isValid).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)

  const accounts = wallet.getAccounts()
  expect(accounts).toHaveLength(1)
  const account = accounts[0]
  expect(account.address).toBe(
    "0x06c67629cae87e7a1b284f1002747af681b39b8199f9263b9aed985e200d8f59",
  )

  const backupWithAccount = await storage.getItem("BACKUP")
  expect(backupWithAccount).toBeDefined()
  expect(JSON.parse(backupWithAccount as string)).toMatchSchema(backupSchema)

  const selectedAccount = await wallet.getSelectedAccount()
  expect(selectedAccount).toBeDefined()
  expect(selectedAccount?.address).toBe(
    "0x06c67629cae87e7a1b284f1002747af681b39b8199f9263b9aed985e200d8f59",
  )
})

test("open existing wallet with wrong password", async () => {
  const storage = new MockStorage()
  storage.setItem("BACKUP", backupString)
  const wallet = new Wallet(storage, compiledContract)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_falsy_secret_password")
  expect(isValid).toBe(false)
  expect(wallet.isSessionOpen()).toBe(false)
})

test("import backup file", async () => {
  const storage = new MockStorage()
  const wallet = new Wallet(storage, compiledContract)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  await wallet.importBackup(backupString)

  expect(wallet.isInitialized()).toBe(true)

  const isValid = await wallet.startSession("my_secret_password")
  expect(isValid).toBe(true)
  expect(wallet.isSessionOpen()).toBe(true)
})

test.skip("import wront backup file", async () => {
  const storage = new MockStorage()
  const wallet = new Wallet(storage, compiledContract)
  await wallet.setup()

  expect(wallet.isInitialized()).toBe(false)

  expect(async () => {
    await wallet.importBackup(backupWrongString)
  }).toThrowError("invalid keystore")

  expect(wallet.isInitialized()).toBe(false)
})
