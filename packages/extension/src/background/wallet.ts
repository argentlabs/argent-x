import { ethers } from "ethers"
import { ProgressCallback } from "ethers/lib/utils"
import {
  Account,
  AddTransactionResponse,
  ec,
  shortString,
  stark,
} from "starknet"
import {
  computeHashOnElements,
  getSelectorFromName,
} from "starknet/dist/utils/hash"
import { BigNumberish } from "starknet/dist/utils/number"

import {
  Network,
  defaultNetwork,
  getProvider,
  isKnownNetwork,
} from "../shared/networks"
import { WalletAccount } from "../shared/wallet.model"
import {
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "./keys/keyDerivation"
import backupSchema from "./schema/backup.schema"
import legacyBackupSchema from "./schema/legacyBackup.schema"
import type { IStorage } from "./storage"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest

const CURRENT_BACKUP_VERSION = 1
export const SESSION_DURATION = 15 * 60 * 60 * 1000 // 15 hours

type KnownNetworkIds = "mainnet-alpha" | "goerli-alpha"
const CHECK_OFFSET = 10
const PROXY_CONTRACT_HASHES_TO_CHECK = [
  "0x71c3c99f5cf76fc19945d4b8b7d34c7c5528f22730d56192b50c6bbfd338a64",
]
const VALID_ACCOUNT_IMPLEMENTATIONS_BY_NETWORK: {
  [n in KnownNetworkIds]: string[]
} = {
  "mainnet-alpha": [
    "0x05f28c66afd8a6799ddbe1933bce2c144625031aafa881fa38fa830790eff204",
    "0x01bd7ca87f139693e6681be2042194cf631c4e8d77027bf0ea9e6d55fc6018ac",
  ],
  "goerli-alpha": [
    "0x0090aa7a9203bff78bfb24f0753c180a33d4bad95b1f4f510b36b00993815704",
    "0x070a61892f03b34f88894f0fb9bb4ae0c63a53f5042f79997862d1dffb8d6a30",
  ],
}

interface WalletSession {
  secret: string
  password: string
}

export interface WalletStorageProps {
  backup?: string
  selected?: string
  accounts?: WalletAccount[]
  discoveredOnce?: boolean
}

/**
 * Belongs into starknet.js
 */
function calculateContractAddress(
  salt: BigNumberish,
  contractHash: BigNumberish,
  constructorCalldata: BigNumberish[],
  callerAddress: BigNumberish = 0,
): string {
  const CONTRACT_ADDRESS_PREFIX = shortString.encodeShortString(
    "STARKNET_CONTRACT_ADDRESS",
  )
  const constructorCalldataHash = computeHashOnElements(constructorCalldata)

  return computeHashOnElements([
    CONTRACT_ADDRESS_PREFIX,
    callerAddress,
    salt,
    contractHash,
    constructorCalldataHash,
  ])
}

export const equalAccount = (
  a: Pick<WalletAccount, "address" | "network">,
  b: Pick<WalletAccount, "address" | "network">,
) => a.address === b.address && a.network.id === b.network.id

export type GetNetwork = (networkId: string) => Promise<Network>

export class Wallet {
  private encryptedBackup?: string
  private session?: WalletSession

  constructor(
    private store: IStorage<WalletStorageProps>,
    private proxyCompiledContract: string,
    private argentAccountCompiledContract: string,
    private getNetwork: GetNetwork,
    private onAutoLock?: () => Promise<void>,
  ) {}

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
    progressCallback?: ProgressCallback,
  ) {
    if (this.isInitialized()) {
      return
    }
    const N = isDevOrTest ? 64 : 32768
    const ethersWallet = ethers.Wallet.createRandom()
    this.encryptedBackup = await ethersWallet.encrypt(
      password,
      { scrypt: { N } },
      progressCallback,
    )

    await this.writeBackup()
    this.setSession(ethersWallet.privateKey, password)
  }

  public async getAccounts(): Promise<WalletAccount[]> {
    const accounts = await this.store.getItem("accounts")
    return accounts || []
  }

  private async setAccounts(accounts: WalletAccount[]) {
    const oldAccounts = await this.getAccounts()

    // combine accounts without duplicates
    const newAccounts = [...oldAccounts, ...accounts].filter(
      (account, index, self) =>
        self.findIndex((a) => a.address === account.address) === index,
    )

    return this.store.setItem("accounts", newAccounts)
  }

  private async pushAccount(account: WalletAccount) {
    const accounts = await this.getAccounts()
    const index = accounts.findIndex((a) => a.address === account.address)
    if (index === -1) {
      accounts.push(account)
    } else {
      accounts[index] = account
    }
    return this.store.setItem("accounts", accounts)
  }

  public async removeAccount(address: string) {
    const accounts = await this.getAccounts()
    const newAccounts = accounts.filter(
      (account) => account.address !== address,
    )
    return this.store.setItem("accounts", newAccounts)
  }

  private resetAccounts() {
    return this.store.setItem("accounts", [])
  }

  public async getSeedPhrase(): Promise<string> {
    if (!this.isSessionOpen() || !this.session || !this.encryptedBackup) {
      throw new Error("Session is not open")
    }
    const wallet = await ethers.Wallet.fromEncryptedJson(
      this.encryptedBackup,
      this.session.password,
    )

    return wallet.mnemonic.phrase
  }

  public async restoreSeedPhrase(seedPhrase: string, newPassword: string) {
    if (this.isInitialized() || this.session) {
      throw new Error("Wallet is already initialized")
    }
    const ethersWallet = ethers.Wallet.fromMnemonic(seedPhrase)
    const N = isDevOrTest ? 64 : 32768
    const encryptedBackup = await ethersWallet.encrypt(newPassword, {
      scrypt: { N },
    })

    this.importBackup(encryptedBackup)
    this.setSession(ethersWallet.privateKey, newPassword)

    await this.discoverAccounts()
  }

  public async discoverAccounts() {
    if (!this.session?.secret) {
      throw new Error("Wallet is not initialized")
    }
    const wallet = new ethers.Wallet(this.session?.secret)

    const networks = ["mainnet-alpha", "goerli-alpha"] as const
    const accountsResults = await Promise.all(
      networks.map(async (networkId) => {
        return this.restoreAccountsFromWallet(wallet, networkId)
      }),
    )
    const accounts = accountsResults.flatMap((x) => x)

    await this.setAccounts(accounts)

    this.store.setItem("discoveredOnce", true)
  }

  private async restoreAccountsFromWallet(
    wallet: ethers.Wallet,
    networkId: string,
    networkAccountImplementations?: string[],
    offset: number = CHECK_OFFSET,
  ): Promise<WalletAccount[]> {
    const network = await this.getNetwork(networkId)

    if (!network) {
      // If network is not defined, we can't restore any accounts
      return []
    }

    const provider = getProvider(network)

    const accounts: WalletAccount[] = []

    const implementations = isKnownNetwork(networkId)
      ? VALID_ACCOUNT_IMPLEMENTATIONS_BY_NETWORK[networkId]
      : networkAccountImplementations

    if (!implementations) {
      throw new Error(`No known implementations for network ${networkId}`)
    }

    const contractHashAndImplementations2dArray =
      PROXY_CONTRACT_HASHES_TO_CHECK.flatMap((contractHash) =>
        implementations.map((implementation) => [contractHash, implementation]),
      )

    const promises = contractHashAndImplementations2dArray.map(
      async ([contractHash, implementation]) => {
        let lastHit = 0
        let lastCheck = 0

        while (lastHit + offset > lastCheck) {
          const starkPair = getStarkPair(lastCheck, wallet.privateKey)
          const starkPub = ec.getStarkKey(starkPair)
          const seed = starkPub

          const address = calculateContractAddress(
            seed,
            contractHash,
            stark.compileCalldata({ implementation }),
          )

          const code = await provider.getCode(address)

          if (code.bytecode.length > 0) {
            lastHit = lastCheck
            accounts.push({
              address,
              network,
              signer: {
                type: "local_signer",
                derivationPath: getPathForIndex(lastCheck),
              },
            })
          }

          ++lastCheck
        }
      },
    )

    await Promise.all(promises)

    return accounts
  }

  public async startSession(
    password: string,
    progressCallback?: ProgressCallback,
  ): Promise<boolean> {
    // session has already started
    if (this.session) {
      return true
    }

    // wallet is not initialized: let's initialise it
    if (!this.isInitialized()) {
      await this.generateNewLocalSecret(password, progressCallback)
      return true
    }

    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(
        this.encryptedBackup as string,
        password,
        progressCallback,
      )

      this.setSession(wallet.privateKey, password)

      // if we have not yet discovered accounts, do it now. This only applies to wallets which got restored from a backup file, as we could not restore all accounts from onchain yet as the backup was locked until now.
      const discoveredOnce = await this.store.getItem("discoveredOnce")
      if (!discoveredOnce) {
        await this.discoverAccounts()
      }

      return true
    } catch {
      return false
    }
  }

  public checkPassword(password: string): boolean {
    return this.session?.password === password
  }

  public async discoverAccountsForNetwork(
    networkId: string,
    offset: number = CHECK_OFFSET,
  ) {
    if (!this.isSessionOpen() || !this.session?.secret) {
      throw new Error("Session is not open")
    }
    const wallet = new ethers.Wallet(this.session?.secret)
    const network = await this.getNetwork(networkId)

    if (!network.accountImplementation) {
      // silent fail if no account implementation is defined for this network
      return
    }

    const accounts = await this.restoreAccountsFromWallet(
      wallet,
      networkId,
      [network.accountImplementation],
      offset,
    )

    await this.setAccounts(accounts)
  }

  public async addAccount(
    networkId: string,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    // FIXME: delete this once Cairo 9 is on mainnet
    if (networkId === "mainnet-alpha") {
      return this.addAccountPreCairo9(networkId)
    }

    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    const currentPaths = (await this.getAccounts())
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.network.id === networkId,
      )
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths)
    const starkPair = getStarkPair(index, this.session?.secret as string)
    const starkPub = ec.getStarkKey(starkPair)
    const seed = starkPub

    const network = await this.getNetwork(networkId)
    const provider = getProvider(network)

    let implementation = network.accountImplementation
    if (!implementation) {
      const deployImplementationTransaction = await provider.deployContract({
        contract: this.argentAccountCompiledContract,
      })
      assertTransactionReceived(deployImplementationTransaction, true)
      implementation = deployImplementationTransaction.address as string
    } else {
      // if there is an implementation, we need to check if accounts were already deployed
      this.discoverAccountsForNetwork(networkId)
    }

    const deployTransaction = await provider.deployContract({
      contract: this.proxyCompiledContract,
      constructorCalldata: stark.compileCalldata({
        implementation,
        selector: getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
      }),
      addressSalt: seed,
    })

    assertTransactionReceived(deployTransaction, true)
    const proxyAddress = deployTransaction.address as string

    const account = {
      network,
      address: proxyAddress,
      signer: {
        type: "local_secret",
        derivationPath: getPathForIndex(index),
      },
    }

    await this.pushAccount(account)

    await this.writeBackup()
    await this.selectAccount(account.address)

    return { account, txHash: deployTransaction.transaction_hash }
  }

  // FIXME: delete this once Cairo 9 is on mainnet
  public async addAccountPreCairo9(
    networkId: string,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    const currentPaths = (await this.getAccounts())
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.network.id === networkId,
      )
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths)
    const starkPair = getStarkPair(index, this.session?.secret as string)
    const starkPub = ec.getStarkKey(starkPair)
    const seed = starkPub

    const network = await this.getNetwork(networkId)
    const provider = getProvider(network)

    let implementation = network.accountImplementation
    if (!implementation) {
      const deployImplementationTransaction = await provider.deployContract({
        contract: this.argentAccountCompiledContract,
      })
      assertTransactionReceived(deployImplementationTransaction, true)
      implementation = deployImplementationTransaction.address as string
    } else {
      // if there is an implementation, we need to check if accounts were already deployed
      this.discoverAccountsForNetwork(networkId)
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
      network,
      address: proxyAddress,
      signer: {
        type: "local_secret",
        derivationPath: getPathForIndex(index),
      },
    }

    await this.pushAccount(account)

    await this.writeBackup()
    await this.selectAccount(account.address)

    return { account, txHash: initTransaction.transaction_hash }
  }

  public async getAccountByAddress(address: string): Promise<WalletAccount> {
    const hit = (await this.getAccounts()).find(
      (account) => account.address === address,
    )
    if (!hit) {
      throw Error("account not found")
    }
    return hit
  }

  public getKeyPairByDerivationPath(derivationPath: string) {
    return getStarkPair(derivationPath, this.session?.secret as string)
  }

  public async getStarknetAccountByAddress(address: string): Promise<Account> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }
    const account = await this.getAccountByAddress(address)
    if (!account) {
      throw Error("account not found")
    }

    const keyPair = this.getKeyPairByDerivationPath(
      account.signer.derivationPath,
    )
    const provider = getProvider(account.network)
    return new Account(provider, account.address, keyPair)
  }

  public async getSelectedStarknetAccount(): Promise<Account> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    const account = await this.getSelectedAccount()
    if (!account) {
      throw new Error("no selected account")
    }

    return this.getStarknetAccountByAddress(account.address)
  }

  public async getSelectedAccount(): Promise<WalletAccount | undefined> {
    if (!this.isSessionOpen()) {
      return
    }
    const accounts = await this.getAccounts()
    const address = await this.store.getItem("selected")
    const account = accounts.find((account) => account.address === address)
    const defaultAccount = accounts.find(
      (account) => account.network.id === defaultNetwork.id,
    )
    return account ?? defaultAccount ?? accounts[0]
  }

  public async selectAccount(address: string) {
    const account = (await this.getAccounts()).find(
      (account) => account.address === address,
    )
    if (account) {
      await this.store.setItem("selected", account.address)
    }
  }

  public lock() {
    this.session = undefined
  }

  public async reset() {
    await this.resetAccounts()
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

  public async exportPrivateKey(): Promise<string> {
    if (!this.isSessionOpen() || !this.session?.secret) {
      throw new Error("Session is not open")
    }

    const account = await this.getSelectedAccount()
    if (!account) {
      throw new Error("no selected account")
    }

    const starkPair = getStarkPair(
      account.signer.derivationPath,
      this.session.secret,
    )

    return starkPair.priv.toString()
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
      this.onAutoLock?.()
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
    if (backup.argent?.version !== CURRENT_BACKUP_VERSION) {
      // in the future, backup file migration will happen here
    }

    await this.recoverAccountsFromBackupFile(backup)
  }

  private async recoverAccountsFromBackupFile(backup: any): Promise<void> {
    const accounts: WalletAccount[] = await Promise.all(
      (backup.argent?.accounts ?? []).map(async (account: any) => {
        const network = await this.getNetwork(account.network)
        return {
          ...account,
          network,
        }
      }),
    )

    await this.setAccounts(accounts)
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
        accounts: (await this.getAccounts()).map((account) => ({
          ...account,
          network: account.network.id,
        })),
      },
    }
    const backupString = JSON.stringify(extendedBackup)

    if (!Wallet.validateBackup(backupString)) {
      console.error(backupString)
      throw new Error("invalid new backup file")
    }

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
