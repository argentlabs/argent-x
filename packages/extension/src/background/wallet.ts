import { ethers } from "ethers"
import { Account, ec, stark } from "starknet"

import { getNetwork, getProvider } from "../shared/networks"
import { WalletAccount } from "../shared/wallet.model"
import {
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "./keys/keyDerivation"
import backupSchema from "./schema/backup.schema"
import legacyBackupSchema from "./schema/legacyBackup.schema"
import { IStorage } from "./storage"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest

const CURRENT_BACKUP_VERSION = 1
export const SESSION_DURATION = 15 * 60 * 60 * 1000 // 15 hours

interface WalletSession {
  secret: string
  password: string
}

export interface WalletStorageProps {
  backup?: string
  selected?: string
}

export class Wallet {
  private accounts: WalletAccount[] = []

  private encryptedBackup?: string
  private session?: WalletSession

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

  private async generateNewLocalSecret(password: string) {
    if (this.isInitialized()) {
      return
    }
    const N = isDevOrTest ? 64 : 32768
    const ethersWallet = ethers.Wallet.createRandom()
    this.encryptedBackup = await ethersWallet.encrypt(password, {
      scrypt: { N },
    })

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
    accountImplementation?: string,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    const current_paths = this.accounts
      .filter((account) => account.signer.type === "local_secret")
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(current_paths)
    const starkPair = getStarkPair(index, this.session?.secret as string)
    const starkPub = ec.getStarkKey(starkPair)
    const seed = starkPub

    const provider = getProvider(networkId)
    const network = getNetwork(networkId)

    const implementation =
      accountImplementation ?? network.accountImplementation
    if (!implementation) {
      throw new Error("Argent Account implementation is undefined")
    }

    const deployTransaction = await provider.deployContract({
      contract: this.compiledContract,
      constructorCalldata: stark.compileCalldata({ implementation }),
      addressSalt: seed,
    })

    if (
      deployTransaction.code !== "TRANSACTION_RECEIVED" ||
      !deployTransaction.address
    ) {
      throw new Error("Deploy transaction failed")
    }

    const initTransaction = await provider.invokeFunction({
      contractAddress: deployTransaction.address,
      entrypoint: "initialize",
      calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
    })

    if (initTransaction.code !== "TRANSACTION_RECEIVED") {
      throw new Error("Init transaction failed")
    }

    const account = {
      network: networkId,
      address: deployTransaction.address,
      signer: {
        type: "local_secret",
        derivationPath: getPathForIndex(index),
      },
    }

    this.accounts.push(account)

    await this.writeBackup()
    await this.selectAccount(deployTransaction.address)

    return { account, txHash: initTransaction.transaction_hash }
  }

  public getAccounts(): WalletAccount[] {
    return this.accounts
  }

  public async getSelectedStarknetAccount(): Promise<Account> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    const account = await this.getSelectedAccount()
    if (!account) {
      throw new Error("no selected account")
    }

    const keyPair = getStarkPair(
      account.signer.derivationPath,
      this.session?.secret as string,
    )
    const provider = getProvider(account.network)
    return new Account(provider, account.address, keyPair)
  }

  public async getSelectedAccount(): Promise<WalletAccount | undefined> {
    if (this.accounts.length === 0 || !this.isSessionOpen()) {
      return
    }

    const address = await this.store.getItem("selected")
    const account = this.accounts.find((account) => account.address === address)
    return account ?? this.accounts[0]
  }

  public async selectAccount(address: string) {
    const account = this.accounts.find((account) => account.address === address)
    if (account) {
      await this.store.setItem("selected", account.address)
    }
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
      if (Wallet.isLegacyBackup(backupString)) {
        throw new Error("legacy backup file cannot be imported")
      }
      throw new Error("invalid backup file")
    }
    await this.store.setItem("backup", backupString)
    await this.setup()
  }

  public exportBackup(): { url: string; filename: string } {
    if (this.encryptedBackup === undefined) {
      throw Error("no local backup")
    }
    const blob = new Blob([this.encryptedBackup], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const filename = "argent-x-backup.json"
    return { url, filename }
  }

  public static validateBackup(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString)
      return backupSchema.isValidSync(backup)
    } catch {
      return false
    }
  }

  public static isLegacyBackup(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString)
      return legacyBackupSchema.isValidSync(backup)
    } catch {
      return false
    }
  }

  private setSession(secret: string, password: string) {
    this.session = { secret, password }

    setTimeout(() => {
      this.lock()
    }, SESSION_DURATION)
  }

  private async readBackup() {
    this.encryptedBackup = await this.store.getItem("backup")
    if (this.encryptedBackup === undefined) {
      return
    }

    if (!Wallet.validateBackup(this.encryptedBackup)) {
      this.encryptedBackup = undefined
      throw new Error("invalid backup file in local storage")
    }

    const backup = JSON.parse(this.encryptedBackup)
    if (backup.argent.version !== CURRENT_BACKUP_VERSION) {
      // in the future, backup file migration will happen here
    }

    this.accounts = backup.argent.accounts
  }

  private async writeBackup() {
    if (this.encryptedBackup === undefined) {
      return
    }
    const backup = JSON.parse(this.encryptedBackup)
    const extendedBackup = {
      ...backup,
      argent: {
        version: CURRENT_BACKUP_VERSION,
        accounts: this.accounts,
      },
    }
    const backupString = JSON.stringify(extendedBackup)
    await this.store.setItem("backup", backupString)
    this.encryptedBackup = backupString
  }
}
