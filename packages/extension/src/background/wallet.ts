import { ethers } from "ethers"
import { ProgressCallback } from "ethers/lib/utils"
import { find, noop, throttle, union } from "lodash-es"
import {
  Abi,
  Account,
  Contract,
  DeployContractPayload,
  EstimateFee,
  ec,
  number,
  stark,
} from "starknet"
import {
  calculateContractAddressFromHash,
  getSelectorFromName,
} from "starknet/dist/utils/hash"
import { Account as Accountv4 } from "starknet4"
import browser from "webextension-polyfill"

import { ArgentAccountType } from "./../shared/wallet.model"
import ProxyCompiledContractAbi from "../abis/Proxy.json"
import { getAccountTypesFromChain } from "../shared/account/details/fetchType"
import { withHiddenSelector } from "../shared/account/selectors"
import {
  Network,
  defaultNetwork,
  defaultNetworks,
  getProvider,
} from "../shared/network"
import { getProviderv4 } from "../shared/network/provider"
import {
  IArrayStorage,
  IKeyValueStorage,
  IObjectStorage,
  KeyValueStorage,
  ObjectStorage,
} from "../shared/storage"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import { accountsEqual, baseDerivationPath } from "../shared/wallet.service"
import { LoadContracts } from "./accounts"
import {
  getIndexForPath,
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "./keys/keyDerivation"
import backupSchema from "./schema/backup.schema"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest
const SCRYPT_N = isDevOrTest ? 64 : 262144 // 131072 is the default value used by ethers

const CURRENT_BACKUP_VERSION = 1
export const SESSION_DURATION = isDev ? 24 * 60 * 60 : 30 * 60 // 30 mins in prod, 24 hours in dev

const CHECK_OFFSET = 10

export const PROXY_CONTRACT_CLASS_HASHES = [
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
]
export const ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES = [
  "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
  "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
  "0x7e28fb0161d10d1cf7fe1f13e7ca57bce062731a3bd04494dfd2d0412699727",
]

export interface WalletSession {
  secret: string
  password: string
}

export interface WalletStorageProps {
  backup?: string
  selected?: BaseWalletAccount
  discoveredOnce?: boolean
}

export const walletStore = new KeyValueStorage<WalletStorageProps>(
  {},
  "core:wallet",
)

export const sessionStore = new ObjectStorage<WalletSession | null>(null, {
  namespace: "core:wallet:session",
  areaName: "session",
})

export type GetNetwork = (networkId: string) => Promise<Network>

export class Wallet {
  constructor(
    private readonly store: IKeyValueStorage<WalletStorageProps>,
    private readonly walletStore: IArrayStorage<WalletAccount>,
    private readonly sessionStore: IObjectStorage<WalletSession | null>,
    private readonly loadContracts: LoadContracts,
    private readonly getNetwork: GetNetwork,
  ) {}

  public async isInitialized(): Promise<boolean> {
    return Boolean(await this.store.get("backup"))
  }

  public async isSessionOpen(): Promise<boolean> {
    return (await this.sessionStore.get()) !== null
  }

  private async generateNewLocalSecret(
    password: string,
    progressCallback?: ProgressCallback,
  ) {
    if (await this.isInitialized()) {
      return
    }

    const ethersWallet = ethers.Wallet.createRandom()
    const encryptedBackup = await ethersWallet.encrypt(
      password,
      { scrypt: { N: SCRYPT_N } },
      progressCallback,
    )

    await this.store.set("discoveredOnce", true)
    await this.store.set("backup", encryptedBackup)
    return this.setSession(ethersWallet.privateKey, password)
  }

  public async getSeedPhrase(): Promise<string> {
    const session = await this.sessionStore.get()
    const backup = await this.store.get("backup")

    if (!(await this.isSessionOpen()) || !session || !backup) {
      throw new Error("Session is not open")
    }

    const wallet = await ethers.Wallet.fromEncryptedJson(
      backup,
      session.password,
    )

    return wallet.mnemonic.phrase
  }

  public async restoreSeedPhrase(seedPhrase: string, newPassword: string) {
    const session = await this.sessionStore.get()
    if ((await this.isInitialized()) || session) {
      throw new Error("Wallet is already initialized")
    }
    const ethersWallet = ethers.Wallet.fromMnemonic(seedPhrase)
    const encryptedBackup = await ethersWallet.encrypt(newPassword, {
      scrypt: { N: SCRYPT_N },
    })

    await this.importBackup(encryptedBackup)
    await this.setSession(ethersWallet.privateKey, newPassword)

    await this.discoverAccounts()
  }

  public async discoverAccounts() {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new Error("Wallet is not initialized")
    }
    const wallet = new ethers.Wallet(session?.secret)

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

    await this.walletStore.push(accounts)

    this.store.set("discoveredOnce", true)
  }

  private async getAccountClassHashForNetwork(
    network: Network,
    accountType: ArgentAccountType,
    deployerAccount?: Account, // Only for use with devnet
  ): Promise<string> {
    if (network.accountClassHash) {
      if (
        accountType === "argent-plugin" &&
        network.accountClassHash.argentPluginAccount
      ) {
        return network.accountClassHash.argentPluginAccount
      }
      return network.accountClassHash.argentAccount
    }
    const [proxyContract, accountContract] = await this.loadContracts(
      network.id,
    )

    if (deployerAccount) {
      await deployerAccount.declare({
        classHash: PROXY_CONTRACT_CLASS_HASHES[0],
        contract: proxyContract,
      })

      const declareResponse = await deployerAccount.declare({
        classHash: ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0],
        contract: accountContract,
      })

      return declareResponse.class_hash
    }

    return ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0]
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
      network?.accountClassHash?.argentAccount
        ? [network.accountClassHash.argentAccount]
        : [],
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

          const address = calculateContractAddressFromHash(
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
            0,
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
              type: "argent",
              needsDeploy: false, // Only deployed accounts will be recovered
            })
          }

          ++lastCheck
        }
      },
    )

    await Promise.all(promises)

    try {
      const accountWithTypes = await getAccountTypesFromChain(accounts)
      return accountWithTypes
    } catch (error) {
      console.error("Error getting account types from chain", error)
      return accounts
    }
  }

  public async startSession(
    password: string,
    progressCallback?: ProgressCallback,
  ): Promise<boolean> {
    // session has already started
    const session = await this.sessionStore.get()
    if (session) {
      return true
    }

    const throttledProgressCallback = throttle(progressCallback ?? noop, 50, {
      leading: true,
      trailing: true,
    })

    // wallet is not initialized: let's initialise it
    if (!(await this.isInitialized())) {
      await this.generateNewLocalSecret(password, throttledProgressCallback)
      return true
    }

    const backup = await this.store.get("backup")

    if (!backup) {
      throw new Error("Backup is not found")
    }

    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(
        backup,
        password,
        throttledProgressCallback,
      )

      await this.setSession(wallet.privateKey, password)

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

  public async checkPassword(password: string): Promise<boolean> {
    const session = await this.sessionStore.get()
    return session?.password === password
  }

  public async discoverAccountsForNetwork(
    network?: Network,
    offset: number = CHECK_OFFSET,
  ) {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session?.secret) {
      throw new Error("Session is not open")
    }
    const wallet = new ethers.Wallet(session?.secret)

    if (!network?.accountClassHash) {
      // silent fail if no account implementation is defined for this network
      return
    }

    const accounts = await this.restoreAccountsFromWallet(
      wallet.privateKey,
      network,
      offset,
    )

    await this.walletStore.push(accounts)
  }

  public async newAccount(networkId: string): Promise<WalletAccount> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session) {
      throw Error("no open session")
    }

    const network = await this.getNetwork(networkId)

    await this.discoverAccountsForNetwork(network, 1) // discover until there is an free index found

    const accounts = await this.walletStore.get(withHiddenSelector)

    const currentPaths = accounts
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.network.id === networkId,
      )
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths, baseDerivationPath)

    const payload = await this.getDeployContractPayloadForAccountIndex(
      index,
      networkId,
    )

    const proxyClassHash = PROXY_CONTRACT_CLASS_HASHES[0]

    const proxyAddress = calculateContractAddressFromHash(
      payload.addressSalt,
      proxyClassHash,
      payload.constructorCalldata,
      0,
    )

    const account: WalletAccount = {
      network,
      networkId: network.id,
      address: proxyAddress,
      signer: {
        type: "local_secret" as const,
        derivationPath: getPathForIndex(index, baseDerivationPath),
      },
      type: "argent",
      needsDeploy: true,
    }

    await this.walletStore.push([account])

    await this.selectAccount(account)

    return account
  }

  public async deployAccount(
    walletAccount: WalletAccount,
    deployerAccount?: Account,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    const starknetAccount = await this.getStarknetAccount(walletAccount)
    const accountClassHash = await this.getAccountClassHashForNetwork(
      walletAccount.network,
      "argent",
      deployerAccount,
    )

    if (!("deployAccount" in starknetAccount)) {
      throw Error("Cannot deploy old accounts")
    }

    const starkPair = await this.getKeyPairByDerivationPath(
      walletAccount.signer.derivationPath,
    )

    const starkPub = ec.getStarkKey(starkPair)

    const deployAccountPayload = {
      classHash: PROXY_CONTRACT_CLASS_HASHES[0],
      contractAddress: starknetAccount.address,
      constructorCalldata: stark.compileCalldata({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
      }),
      addressSalt: starkPub,
    }

    const { transaction_hash } = await starknetAccount.deployAccount(
      deployAccountPayload,
    )

    await this.selectAccount(walletAccount)

    return { account: walletAccount, txHash: transaction_hash }
  }

  public async getAccountDeploymentFee(
    walletAccount: WalletAccount,
    deployerAccount?: Account,
  ): Promise<EstimateFee> {
    const starknetAccount = await this.getStarknetAccount(walletAccount)
    const accountClassHash = await this.getAccountClassHashForNetwork(
      walletAccount.network,
      "argent",
      deployerAccount,
    )

    if (!("deployAccount" in starknetAccount)) {
      throw Error("Cannot estimate fee to deploy old accounts")
    }

    const starkPair = await this.getKeyPairByDerivationPath(
      walletAccount.signer.derivationPath,
    )

    const starkPub = ec.getStarkKey(starkPair)

    const deployAccountPayload = {
      classHash: PROXY_CONTRACT_CLASS_HASHES[0],
      contractAddress: starknetAccount.address,
      constructorCalldata: stark.compileCalldata({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
      }),
      addressSalt: starkPub,
    }

    return starknetAccount.estimateAccountDeployFee(deployAccountPayload)
  }

  public async redeployAccount(account: WalletAccount) {
    if (!this.isSessionOpen()) {
      throw Error("no open session")
    }
    const networkId = account.networkId
    const network = await this.getNetwork(networkId)

    const provider = getProvider(network)

    const index = getIndexForPath(
      account.signer.derivationPath,
      baseDerivationPath,
    )

    const payload = await this.getDeployContractPayloadForAccountIndex(
      index,
      networkId,
    )

    const deployTransaction = await provider.deployContract(payload)

    return { account, txHash: deployTransaction.transaction_hash }
  }

  public async getDeployContractPayloadForAccountIndex(
    index: number,
    networkId: string,
  ): Promise<Required<DeployContractPayload>> {
    const hasSession = await this.isSessionOpen()
    const session = await this.sessionStore.get()
    const initialised = await this.isInitialized()

    if (!initialised) {
      throw Error("wallet is not initialized")
    }
    if (!hasSession || !session) {
      throw Error("no open session")
    }

    const network = await this.getNetwork(networkId)
    const starkPair = getStarkPair(index, session?.secret, baseDerivationPath)
    const starkPub = ec.getStarkKey(starkPair)
    const [proxyCompiledContract] = await this.loadContracts(baseDerivationPath)

    const accountClassHash = await this.getAccountClassHashForNetwork(
      network,
      "argent",
    )

    const payload = {
      contract: proxyCompiledContract,
      constructorCalldata: stark.compileCalldata({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
      }),
      addressSalt: starkPub,
    }

    return payload
  }

  public async getAccount(selector: BaseWalletAccount): Promise<WalletAccount> {
    const [hit] = await this.walletStore.get((account) =>
      accountsEqual(account, selector),
    )
    if (!hit) {
      throw Error("account not found")
    }
    return hit
  }

  public async getKeyPairByDerivationPath(derivationPath: string) {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw Error("session is not open")
    }
    return getStarkPair(derivationPath, session.secret)
  }

  public async getStarknetAccount(
    selector: BaseWalletAccount,
    useLatest = false,
  ): Promise<Account | Accountv4> {
    if (!(await this.isSessionOpen())) {
      throw Error("no open session")
    }
    const account = await this.getAccount(selector)
    if (!account) {
      throw Error("account not found")
    }

    const keyPair = await this.getKeyPairByDerivationPath(
      account.signer.derivationPath,
    )

    const provider = getProvider(
      account.network && account.network.baseUrl
        ? account.network
        : await this.getNetwork(selector.networkId),
    )

    const providerV4 = getProviderv4(
      account.network && account.network.baseUrl
        ? account.network
        : await this.getNetwork(selector.networkId),
    )

    if (account.needsDeploy || useLatest) {
      return new Account(provider, account.address, keyPair)
    }

    const oldAccount = new Accountv4(providerV4, account.address, keyPair)

    const isOldAccount = await this.isNonceManagedOnAccountContract(oldAccount)

    return isOldAccount
      ? oldAccount
      : new Account(provider, account.address, keyPair)
  }

  public async isNonceManagedOnAccountContract(account: Accountv4) {
    try {
      // This will fetch nonce from account contract instead of Starknet OS
      await account.getNonce()
      return true
    } catch {
      return false
    }
  }

  public async getCurrentImplementation(
    account: WalletAccount,
  ): Promise<string> {
    const provider = getProvider(account.network)

    const proxyContract = new Contract(
      ProxyCompiledContractAbi as Abi,
      account.address,
      provider,
    )

    const { implementation } = await proxyContract.call("get_implementation")
    return stark.makeAddress(number.toHex(implementation))
  }

  public async getSelectedStarknetAccount(): Promise<Account | Accountv4> {
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
    const accounts = await this.walletStore.get()
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
    const accounts = await this.walletStore.get()
    const account = find(accounts, (account) =>
      accountsEqual(account, accountIdentifier),
    )

    if (account) {
      const { address, networkId } = account // makes sure to strip away unused properties
      await this.store.set("selected", { address, networkId })
    }
  }

  public async lock() {
    await this.sessionStore.set(this.sessionStore.defaults)
  }

  public async exportBackup(): Promise<{ url: string; filename: string }> {
    const backup = await this.store.get("backup")

    if (!backup) {
      throw Error("no local backup")
    }
    const blob = new Blob([backup], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const filename = "argent-x-backup.json"
    return { url, filename }
  }

  public async exportPrivateKey(): Promise<string> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session?.secret) {
      throw new Error("Session is not open")
    }

    const account = await this.getSelectedAccount()
    if (!account) {
      throw new Error("no selected account")
    }

    const starkPair = getStarkPair(
      account.signer.derivationPath,
      session.secret,
    )

    return starkPair.getPrivate().toString()
  }

  public static validateBackup(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString)
      return backupSchema.isValidSync(backup)
    } catch {
      return false
    }
  }

  private async setSession(secret: string, password: string) {
    await this.sessionStore.set({ secret, password })

    browser.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === "session_timeout") {
        return this.lock()
      }
    })

    const alarm = await browser.alarms.get("session_timeout")
    if (alarm?.name !== "session_timeout") {
      browser.alarms.create("session_timeout", {
        delayInMinutes: SESSION_DURATION,
      })
    }
  }

  public async importBackup(backup: string): Promise<void> {
    if (!Wallet.validateBackup(backup)) {
      throw new Error("invalid backup file in local storage")
    }

    const backupJson = JSON.parse(backup)
    if (backupJson.argent?.version !== CURRENT_BACKUP_VERSION) {
      // in the future, backup file migration will happen here
    }

    await this.store.set("backup", backup)

    const accounts: WalletAccount[] = await Promise.all(
      (backupJson.argent?.accounts ?? []).map(async (account: any) => {
        const network = await this.getNetwork(account.network)
        return {
          ...account,
          network,
          networkId: network.id,
        }
      }),
    )

    if (accounts.length > 0) {
      await this.walletStore.push(accounts)
    }
  }
}
