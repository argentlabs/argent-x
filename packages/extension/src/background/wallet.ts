import { EventEmitter } from "events"

import { ethers } from "ethers"
import { Account, AddTransactionResponse, ec, stark, Signer, LedgerBlindSigner} from "starknet"

import { getNetwork, getProvider } from "../shared/networks"
import { WalletAccount, WalletAccountSigner } from "../shared/wallet.model"

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

export class Wallet extends EventEmitter {
  private accounts: WalletAccount[] = []

  private encryptedBackup?: string
  private session?: WalletSession

  private store: IStorage<WalletStorageProps>
  private proxyCompiledContract: string
  private argentAccountCompiledContract: string

  constructor(
    store: IStorage<WalletStorageProps>,
    proxyCompiledContract: string,
    argentAccountCompiledContract: string,
  ) {
    super()
    this.store = store
    this.proxyCompiledContract = proxyCompiledContract
    this.argentAccountCompiledContract = argentAccountCompiledContract
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
    type: string
  ): Promise<{ account: WalletAccount; txHash: string }> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    let starkPub;
    let signer: WalletAccountSigner;
    if (type === "ledger_nano") {
      const ledgerSigner = new LedgerBlindSigner()
      starkPub = await ledgerSigner.getPubKey()
      signer = {
        type: "ledger_nano",
        derivationPath: ledgerSigner.derivationPath,
        signer: ledgerSigner
      }
    }
    else {
      const current_paths = this.accounts
      .filter((account) => account.signer.type === "local_secret")
      .map((account) => account.signer.derivationPath)
      const index = getNextPathIndex(current_paths)
      const starkPair = getStarkPair(index, this.session?.secret as string)
      starkPub = ec.getStarkKey(starkPair)
      const localSigner = new Signer(starkPair);
      signer = {
        type: "local_secret",
        derivationPath: getPathForIndex(index),
        signer: localSigner
      }
    }
    
    const seed = starkPub
    const provider = getProvider(networkId)
    const network = getNetwork(networkId)

    let implementation = network.accountImplementation
    if (!implementation) {
      const deployImplementationTransaction = await provider.deployContract({
        contract: this.argentAccountCompiledContract,
      })
      assertTransactionReceived(deployImplementationTransaction, true)
      implementation = deployImplementationTransaction.address as string
    }

    const deployTransaction = await provider.deployContract({
      contract: this.proxyCompiledContract,
      constructorCalldata: stark.compileCalldata({ implementation }),
      addressSalt: seed,
    })

    assertTransactionReceived(deployTransaction, true)
    const proxyAddress = deployTransaction.address as string

    const initTransaction = await provider.invokeFunction({
      contractAddress: proxyAddress,
      entrypoint: "initialize",
      calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
    })

    assertTransactionReceived(initTransaction)

    const account = {
      network: networkId,
      address: proxyAddress,
      signer: signer
    }

    this.accounts.push(account)

    await this.writeBackup()
    await this.selectAccount(account.address)

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

    const provider = getProvider(account.network)
    return new Account(provider, account.address, account.signer.signer)
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

  public reset() {
    this.accounts = []
    this.encryptedBackup = undefined
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
      this.emit("autoLock")
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

const assertTransactionReceived = (
  transactionResponse: AddTransactionResponse,
  deployContract = false,
) => {
  if (transactionResponse.code !== "TRANSACTION_RECEIVED") {
    throw new Error(
      `Transaction not received: ${transactionResponse.transaction_hash}`,
    )
  }
  if (deployContract && !transactionResponse.address) {
    throw new Error(
      `Contract not deployed: ${transactionResponse.transaction_hash}`,
    )
  }
}
