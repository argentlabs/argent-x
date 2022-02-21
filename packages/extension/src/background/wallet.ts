import Ajv from "ajv"
import { ethers } from "ethers"
import { Signer, compileCalldata, ec } from "starknet"

import { getProvider } from "../shared/networks"
import { WalletAccount } from "../shared/wallet.model"
import { IStorage } from "./interfaces"
import {
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "./keys/keyDerivation"
import backupSchema from "./schema/backup.schema.json"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest

const CURRENT_BACKUP_VERSION = 1

const ajv = new Ajv()

interface WalletSession {
  secret: string
  password: string
}

export interface WalletStorageProps {
  BACKUP?: string
  SELECTED?: string
}

export class Wallet {
  private accounts: WalletAccount[] = []

  private encryptedBackup: string | undefined
  private session: WalletSession | undefined

  private store: IStorage<WalletStorageProps>
  private compiledContract: string

  constructor(store: IStorage<WalletStorageProps>, compiledContract: string) {
    this.store = store
    this.compiledContract = compiledContract
  }

  public async setup() {
    await this.readBackup()
  }

  public isInitialized(): boolean {
    return this.encryptedBackup !== undefined
  }

  public isSessionOpen(): boolean {
    return this.session !== undefined
  }

  private async generateNewLocalSecret(
    password: string,
    progressFn?: (progress: number) => void,
  ) {
    if (this.isInitialized()) {
      return
    }
    const N = isDevOrTest ? 64 : 32768
    const ethersWallet = ethers.Wallet.createRandom()
    this.encryptedBackup = await ethersWallet.encrypt(
      password,
      { scrypt: { N } },
      progressFn,
    )

    await this.writeBackup()
    this.setSession(ethersWallet.privateKey, password)
  }

  public async startSession(password: string): Promise<boolean> {
    // session has already started
    if (this.session) {
      return true
    }

    // wallet is not initialized: let's initialise it
    if (!this.isInitialized()) {
      await this.generateNewLocalSecret(password)
      return true
    }

    try {
      const { privateKey: secret } = await ethers.Wallet.fromEncryptedJson(
        this.encryptedBackup as string,
        password,
      )
      this.setSession(secret, password)
      return true
    } catch (error) {
      return false
    }
  }

  public async addAccount(
    networkId: string,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    const current_paths = this.accounts
      .filter((account) => account.signer.type === "local_secret")
      .map((account) => account.signer.derivation_path)

    const index = getNextPathIndex(current_paths)
    const starkPair = getStarkPair(index, this.session?.secret as string)
    const starkPub = ec.getStarkKey(starkPair)
    const seed = starkPub //ec.getStarkKey(ec.genKeyPair())

    const provider = getProvider(networkId)
    const deployTransaction = await provider.deployContract(
      this.compiledContract,
      compileCalldata({ signer: starkPub, guardian: "0" }),
      seed,
    )

    // TODO: register a L1 address with the wallet as soon as some registry is online

    if (
      deployTransaction.code !== "TRANSACTION_RECEIVED" ||
      !deployTransaction.address
    ) {
      throw new Error("Deploy transaction failed")
    }

    const account = {
      network: networkId,
      address: deployTransaction.address,
      signer: {
        type: "local_secret",
        derivation_path: getPathForIndex(index),
      },
    }

    this.accounts.push(account)

    await this.writeBackup()
    await this.selectAccount(deployTransaction.address)

    return { account, txHash: deployTransaction.transaction_hash }
  }

  public getAccounts(): WalletAccount[] {
    return this.accounts
  }

  public async getSelectedAccountSigner(): Promise<Signer> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    const account = await this.getSelectedAccount()

    const keyPair = getStarkPair(
      account.signer.derivation_path,
      this.session?.secret as string,
    )
    const provider = getProvider(account.network)
    return new Signer(provider, account.address, keyPair)
  }

  public async getSelectedAccount(): Promise<WalletAccount> {
    if (this.accounts.length === 0) {
      throw new Error("no accounts")
    }

    const address = await this.store.getItem("SELECTED")
    const account = this.accounts.find((account) => account.address === address)
    return account ?? this.accounts[0]
  }

  public async selectAccount(address: string) {
    const account = this.accounts.find((account) => account.address === address)
    if (account === undefined) {
      return
    }
    await this.store.setItem("SELECTED", account.address)
  }

  public async removeAccount(address: string) {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }
    this.accounts = this.accounts.filter(
      (account) => account.address !== address,
    )
    await this.writeBackup()
  }

  public lock() {
    this.session = undefined
  }

  public async importBackup(backupString: string) {
    if (!Wallet.validateBackup(backupString)) {
      throw new Error("invalid backup file")
    }
    await this.store.setItem("BACKUP", backupString)
    await this.setup()
  }

  public exportBackup(): { url: string; filename: string } {
    if (!this.isInitialized()) {
      throw Error("no local backup")
    }
    const blob = new Blob([this.encryptedBackup as string], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const filename = "argent-x-backup.json"
    return { url, filename }
  }

  public static validateBackup(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString)
      return ajv.validate(backupSchema, backup)
    } catch (error) {
      return false
    }
  }

  private setSession(secret: string, password: string) {
    this.session = { secret, password }
    if (!isTest) {
      setTimeout(() => {
        this.lock()
      }, 15 * 60 * 60 * 1000)
    }
  }

  private async readBackup() {
    this.encryptedBackup = await this.store.getItem("BACKUP")
    if (this.encryptedBackup === undefined) {
      return
    }

    if (!Wallet.validateBackup(this.encryptedBackup)) {
      this.encryptedBackup = undefined
      throw new Error("invalid backup file in local storage")
    }

    const backup = JSON.parse(this.encryptedBackup)
    if (backup["x-version"] !== CURRENT_BACKUP_VERSION) {
      // in the future, backup file migration will happen here
    }

    this.accounts = backup["x-argent"].accounts
  }

  private async writeBackup() {
    if (this.encryptedBackup === undefined) {
      return
    }
    const backup = JSON.parse(this.encryptedBackup)
    const extendedBackup = {
      ...backup,
      "x-version": CURRENT_BACKUP_VERSION,
      "x-argent": {
        accounts: this.accounts,
      },
    }
    const backupString = JSON.stringify(extendedBackup)
    await this.store.setItem("BACKUP", backupString)
    this.encryptedBackup = backupString
  }
}
