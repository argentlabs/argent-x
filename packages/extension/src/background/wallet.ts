import { ethers } from "ethers"
import { ProgressCallback } from "ethers/lib/utils"
import { differenceWith, find, union, uniqWith } from "lodash-es"
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
  defaultNetworks,
  getProvider,
} from "../shared/network"
import { IKeyValueStorage } from "../shared/storage"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import { accountsEqual, baseDerivationPath } from "../shared/wallet.service"
import { LoadContracts } from "./accounts"
import {
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "./keys/keyDerivation"
import backupSchema from "./schema/backup.schema"
import legacyBackupSchema from "./schema/legacyBackup.schema"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest

const CURRENT_BACKUP_VERSION = 1
export const SESSION_DURATION = 15 * 60 * 60 * 1000 // 15 hours

const CHECK_OFFSET = 10

const PROXY_CONTRACT_CLASS_HASHES = [
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
]
const ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES = [
  "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
]

function mergeArrayStableWith<T>(
  array: T[],
  other: T[],
  compareFn: (a: T, b: T) => boolean,
): T[] {
  const result = [...array]
  for (const element of other) {
    const index = result.findIndex((e) => compareFn(e, element))
    if (index === -1) {
      result.push(element)
    } else {
      result[index] = element
    }
  }
  return result
}

interface WalletSession {
  secret: string
  password: string
}

export interface WalletStorageProps {
  backup?: string
  selected?: BaseWalletAccount
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

export type GetNetwork = (networkId: string) => Promise<Network>

export class Wallet {
  private encryptedBackup?: string
  private session?: WalletSession

  constructor(
    private readonly store: IKeyValueStorage<WalletStorageProps>,
    private readonly loadContracts: LoadContracts,
    private readonly getNetwork: GetNetwork,
    private readonly onAutoLock?: () => Promise<void>,
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
    this.store.set("discoveredOnce", true)
    const ethersWallet = ethers.Wallet.createRandom()
    this.encryptedBackup = await ethersWallet.encrypt(
      password,
      { scrypt: { N } },
      progressCallback,
    )

    await this.writeBackup()
    this.setSession(ethersWallet.privateKey, password)
  }

  public async getAccounts(includeHidden = false): Promise<WalletAccount[]> {
    const accounts = (await this.store.get("accounts")) || []

    // migrate from storing network to just storing networkId
    // populate network back from networkId
    const accountsWithNetworkAndMigrationStatus = await Promise.all(
      accounts.map(
        async (
          account,
        ): Promise<{
          needMigration: boolean
          account: WalletAccount
        }> => {
          let needMigration = false
          try {
            const network = await this.getNetwork(
              account.networkId || account.network?.id,
            )
            if (!network) {
              throw new Error("Network not found")
            }

            // migrations needed
            try {
              if (account.network?.id) {
                account.networkId = account.network.id
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                delete account.network

                needMigration = true
              }
              // migrate signer.type local_signer to local_secret
              if ((account.signer.type as any) !== "local_secret") {
                // currently there is just one type of signer
                account.signer.type = "local_secret"
                needMigration = true
              }
            } catch {
              // noop
            }

            return {
              account: {
                ...account,
                network,
              },
              needMigration,
            }
          } catch {
            return { account, needMigration }
          }
        },
      ),
    )

    const accountsWithNetwork = accountsWithNetworkAndMigrationStatus.map(
      (a) => a.account,
    )

    // combine accounts without duplicates
    const uniqueAccounts = uniqWith(accountsWithNetwork, accountsEqual)

    const needsWrite =
      accountsWithNetworkAndMigrationStatus.some(
        // some account requests migration
        (account) => account.needMigration,
      ) || accountsWithNetwork.length !== uniqueAccounts.length // some accounts were duplicated

    if (needsWrite) {
      // we store the network as it was at the creation date of the wallet. This may be useful in the future.
      await this.store.set("accounts", uniqueAccounts)
    }

    return uniqueAccounts.filter((account) => includeHidden || !account.hidden)
  }

  private async addWalletAccounts(accounts: WalletAccount[]) {
    const oldAccounts = await this.getAccounts(true)

    // combine accounts without duplicates
    const newAccounts = mergeArrayStableWith(
      oldAccounts,
      accounts,
      accountsEqual,
    )

    // we store the network as it was at the creation date of the wallet. This may be useful in the future.
    return this.store.set("accounts", newAccounts)
  }

  private async addWalletAccount(account: WalletAccount) {
    return this.addWalletAccounts([account])
  }

  public async removeAccount(account: BaseWalletAccount) {
    const accounts = await this.getAccounts(true)
    const newAccounts = differenceWith(accounts, [account], accountsEqual)
    return this.store.set("accounts", newAccounts)
  }

  public async hideAccount(account: BaseWalletAccount) {
    const accounts = await this.getAccounts()

    const fullAccount = find(accounts, (a) => accountsEqual(a, account))

    if (!fullAccount) {
      return
    }

    const hiddenAccount: WalletAccount = {
      ...fullAccount,
      hidden: true,
    }

    const newAccounts = mergeArrayStableWith(
      accounts,
      [hiddenAccount],
      accountsEqual,
    )

    await this.store.set("accounts", newAccounts)

    await this.writeBackup()
  }

  private resetAccounts() {
    return this.store.set("accounts", [])
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

    const networks = defaultNetworks
      .map((network) => network.id)
      .filter((networkId) => networkId !== "localhost")
    const accountsResults = await Promise.all(
      networks.map(async (networkId) => {
        const network = await this.getNetwork(networkId)
        if (!network) {
          throw new Error(`Network ${networkId} not found`)
        }
        return this.restoreAccountsFromWallet(wallet.privateKey, network)
      }),
    )
    const accounts = accountsResults.flatMap((x) => x)

    await this.addWalletAccounts(accounts)

    this.store.set("discoveredOnce", true)
  }

  private async getAccountClassHashForNetwork(
    network: Network,
  ): Promise<string> {
    if (network?.accountClassHash) {
      return network.accountClassHash
    }
    const [, accountContract] = await this.loadContracts(network.id)
    const provider = getProvider(network)
    const declareResponse = await provider.declareContract({
      contract: accountContract,
    })
    return declareResponse.class_hash || ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0]
  }

  private async restoreAccountsFromWallet(
    secret: string,
    network: Network,
    offset: number = CHECK_OFFSET,
  ): Promise<WalletAccount[]> {
    const provider = getProvider(network)

    const accounts: WalletAccount[] = []

    const accountClassHashes = union(
      ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES,
      network?.accountClassHash ? [network.accountClassHash] : [],
    )
    const proxyClassHashes = PROXY_CONTRACT_CLASS_HASHES

    if (!accountClassHashes?.length) {
      console.error(`No known account class hashes for network ${network.id}`)
      return accounts
    }

    const proxyClassHashAndAccountClassHash2DMap = proxyClassHashes.flatMap(
      (contractHash) =>
        accountClassHashes.map(
          (implementation) => [contractHash, implementation] as const,
        ),
    )

    const promises = proxyClassHashAndAccountClassHash2DMap.map(
      async ([contractClassHash, accountClassHash]) => {
        let lastHit = 0
        let lastCheck = 0

        while (lastHit + offset > lastCheck) {
          const starkPair = getStarkPair(lastCheck, secret, baseDerivationPath)
          const starkPub = ec.getStarkKey(starkPair)

          const address = calculateContractAddress(
            starkPub,
            contractClassHash,
            stark.compileCalldata({
              implementation: accountClassHash,
              selector: getSelectorFromName("initialize"),
              calldata: stark.compileCalldata({
                signer: starkPub,
                guardian: "0",
              }),
            }),
          )

          const code = await provider.getCode(address)

          if (code.bytecode.length > 0) {
            lastHit = lastCheck
            accounts.push({
              address,
              networkId: network.id,
              network,
              signer: {
                type: "local_secret",
                derivationPath: getPathForIndex(lastCheck, baseDerivationPath),
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
      const discoveredOnce = await this.store.get("discoveredOnce")
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
    network?: Network,
    offset: number = CHECK_OFFSET,
  ) {
    if (!this.isSessionOpen() || !this.session?.secret) {
      throw new Error("Session is not open")
    }
    const wallet = new ethers.Wallet(this.session?.secret)

    if (!network?.accountClassHash) {
      // silent fail if no account implementation is defined for this network
      return
    }

    const accounts = await this.restoreAccountsFromWallet(
      wallet.privateKey,
      network,
      offset,
    )

    await this.addWalletAccounts(accounts)
  }

  public async addAccount(
    networkId: string,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }

    const network = await this.getNetwork(networkId)

    await this.discoverAccountsForNetwork(network, 1) // discover until there is an free index found

    const accounts = await this.getAccounts(true)
    const currentPaths = accounts
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.network.id === networkId,
      )
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths, baseDerivationPath)
    const starkPair = getStarkPair(
      index,
      this.session?.secret as string,
      baseDerivationPath,
    )
    const starkPub = ec.getStarkKey(starkPair)
    const [proxyCompiledContract] = await this.loadContracts(baseDerivationPath)

    const provider = getProvider(network)

    const accountClassHash = await this.getAccountClassHashForNetwork(network)

    const deployTransaction = await provider.deployContract({
      contract: proxyCompiledContract,
      constructorCalldata: stark.compileCalldata({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
      }),
      addressSalt: starkPub,
    })

    assertTransactionReceived(deployTransaction, true)
    const proxyAddress = deployTransaction.address as string

    const account = {
      network,
      networkId: network.id,
      address: proxyAddress,
      signer: {
        type: "local_secret" as const,
        derivationPath: getPathForIndex(index, baseDerivationPath),
      },
    }

    await this.addWalletAccount(account)

    await this.writeBackup()
    await this.selectAccount(account)

    return { account, txHash: deployTransaction.transaction_hash }
  }

  public async getAccount(selector: BaseWalletAccount): Promise<WalletAccount> {
    const accounts = await this.getAccounts()
    const hit = find(accounts, (account) => accountsEqual(account, selector))
    if (!hit) {
      throw Error("account not found")
    }
    return hit
  }

  public getKeyPairByDerivationPath(derivationPath: string) {
    return getStarkPair(derivationPath, this.session?.secret as string)
  }

  public async getStarknetAccount(
    selector: BaseWalletAccount,
  ): Promise<Account> {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }
    const account = await this.getAccount(selector)
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

    return this.getStarknetAccount(account)
  }

  public async getSelectedAccount(): Promise<WalletAccount | undefined> {
    if (!this.isSessionOpen()) {
      return
    }
    const accounts = await this.getAccounts()
    const selectedAccount = await this.store.get("selected")
    const defaultAccount =
      accounts.find((account) => account.networkId === defaultNetwork.id) ??
      accounts[0]
    if (!selectedAccount) {
      return defaultAccount
    }
    const account = find(accounts, (account) =>
      accountsEqual(selectedAccount, account),
    )
    return account ?? defaultAccount
  }

  public async selectAccount(accountIdentifier: BaseWalletAccount) {
    const accounts = await this.getAccounts()
    const account = find(accounts, (account) =>
      accountsEqual(account, accountIdentifier),
    )

    if (account) {
      const { address, networkId } = account // makes sure to strip away unused properties
      await this.store.set("selected", { address, networkId })
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
    await this.store.set("backup", backupString)
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
    this.encryptedBackup = await this.store.get("backup")
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
          networkId: network.id,
        }
      }),
    )

    await this.addWalletAccounts(accounts)
  }

  private async writeBackup() {
    if (this.encryptedBackup === undefined) {
      return
    }
    const backup = JSON.parse(this.encryptedBackup)
    const accounts = (await this.getAccounts(true)).map((account) => ({
      ...account,
      network: account.network.id,
    }))
    const extendedBackup = {
      ...backup,
      argent: { version: CURRENT_BACKUP_VERSION, accounts },
    }
    const backupString = JSON.stringify(extendedBackup)

    if (!Wallet.validateBackup(backupString)) {
      console.error(backupString)
      throw new Error("invalid new backup file")
    }

    await this.store.set("backup", backupString)
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
