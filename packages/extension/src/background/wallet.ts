import { ethers, utils } from "ethers"
import { ProgressCallback } from "ethers/lib/utils"
import {
  find,
  isEmpty,
  memoize,
  noop,
  partition,
  throttle,
  union,
} from "lodash-es"
import {
  Account,
  DeployAccountContractPayload,
  DeployAccountContractTransaction,
  EstimateFee,
  InvocationsDetails,
  KeyPair,
  SignerInterface,
  ec,
  hash,
  number,
  stark,
} from "starknet"
import { Account as Accountv4 } from "starknet4"
import browser from "webextension-polyfill"

import { updateAccountsWithNames } from "./../shared/account/details/updateAccountsWithNames"
import { sortByDerivationPath } from "./../shared/utils/accountsMultisigSort"
import {
  ArgentAccountType,
  BaseMultisigWalletAccount,
  CreateAccountType,
  MultisigData,
  MultisigWalletAccount,
} from "./../shared/wallet.model"
import { getAccountEscapeFromChain } from "../shared/account/details/getAccountEscapeFromChain"
import { getAccountGuardiansFromChain } from "../shared/account/details/getAccountGuardiansFromChain"
import { getAccountTypesFromChain } from "../shared/account/details/getAccountTypesFromChain"
import {
  DetailFetchers,
  getAndMergeAccountDetails,
} from "../shared/account/details/getAndMergeAccountDetails"
import { withHiddenSelector } from "../shared/account/selectors"
import { getMulticallForNetwork } from "../shared/multicall"
import { MultisigAccount } from "../shared/multisig/account"
import { fetchMultisigDataForSigner } from "../shared/multisig/multisig.service"
import { MultisigSigner } from "../shared/multisig/signer"
import { PendingMultisig } from "../shared/multisig/types"
import { getMultisigAccountFromBaseWallet } from "../shared/multisig/utils/baseMultisig"
import {
  Network,
  defaultNetwork,
  defaultNetworks,
  getProvider,
} from "../shared/network"
import { getProviderv4 } from "../shared/network/provider"
import { cosignerSign } from "../shared/shield/backend/account"
import { ARGENT_SHIELD_ENABLED } from "../shared/shield/constants"
import { GuardianSelfSigner } from "../shared/shield/GuardianSelfSigner"
import { GuardianSignerArgentX } from "../shared/shield/GuardianSignerArgentX"
import {
  IArrayStorage,
  IKeyValueStorage,
  IObjectStorage,
  ObjectStorage,
} from "../shared/storage"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import {
  accountsEqual,
  baseDerivationPath,
  getAccountIdentifier,
} from "../shared/wallet.service"
import { isEqualAddress } from "../ui/services/addresses"
import { LoadContracts } from "./accounts"
import {
  declareContracts,
  getPreDeployedAccount,
} from "./devnet/declareAccounts"
import {
  getIndexForPath,
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "./keys/keyDerivation"
import { getNonce, increaseStoredNonce } from "./nonce"
import backupSchema from "./schema/backup.schema"

const { calculateContractAddressFromHash, getSelectorFromName } = hash

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
  "0x33434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
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
  selected?: BaseWalletAccount | null
  discoveredOnce?: boolean
}

export const sessionStore = new ObjectStorage<WalletSession | null>(null, {
  namespace: "core:wallet:session",
  areaName: "session",
})

const isNonceManagedOnAccountContract = memoize(
  async (account: Accountv4, _: BaseWalletAccount) => {
    try {
      // This will fetch nonce from account contract instead of Starknet OS
      await account.getNonce()
      return true
    } catch {
      return false
    }
  },
  (_, account) => {
    const id = getAccountIdentifier(account)
    // memoize for max 5 minutes
    const timestamp = Math.floor(Date.now() / 1000 / 60 / 5)
    return `${id}-${timestamp}`
  },
)

export type GetNetwork = (networkId: string) => Promise<Network>

export class Wallet {
  constructor(
    private readonly store: IKeyValueStorage<WalletStorageProps>,
    private readonly walletStore: IArrayStorage<WalletAccount>,
    private readonly sessionStore: IObjectStorage<WalletSession | null>,
    private readonly multisigStore: IArrayStorage<BaseMultisigWalletAccount>,
    private readonly pendingMultisigStore: IArrayStorage<PendingMultisig>,
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
    const accounts = await this.discoverAccounts()
    if (accounts.length === 0) {
      this.newAccount(defaultNetwork.id)
    }
  }

  public async discoverAccounts() {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new Error("Wallet is not initialized")
    }
    const wallet = new ethers.Wallet(session?.secret)

    const networks = defaultNetworks.map((network) => network.id)

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
    return accounts
  }

  private async getAccountClassHashForNetwork(
    network: Network,
    accountType: ArgentAccountType,
  ): Promise<string> {
    if (network.accountClassHash) {
      return (
        network.accountClassHash[accountType] ??
        network.accountClassHash.standard
      )
    }

    const deployerAccount = await getPreDeployedAccount(network)
    if (deployerAccount) {
      const { accountClassHash } = await declareContracts(
        network,
        deployerAccount,
        this.loadContracts,
      )

      return accountClassHash
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

    const standardAccountClassHash = await this.getAccountClassHashForNetwork(
      network,
      "standard",
    )

    // This will be a standard account hash if multisig is not supported on the network
    // It will be handled by the union function below
    const multisigAccountClassHash = await this.getAccountClassHashForNetwork(
      network,
      "multisig",
    )

    const accountClassHashes = union(ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES, [
      standardAccountClassHash,
      multisigAccountClassHash,
    ])
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

          const account: WalletAccount = {
            name: "Unnamed Account",
            address,
            networkId: network.id,
            network,
            signer: {
              type: "local_secret",
              derivationPath: getPathForIndex(lastCheck, baseDerivationPath),
            },
            type: "standard",
            needsDeploy: false, // Only deployed accounts will be recovered
          }

          const code = await provider.getCode(address)

          if (code.bytecode.length > 0) {
            lastHit = lastCheck
            accounts.push(account) // add a standard account
          } else if (
            isEqualAddress(accountClassHash, multisigAccountClassHash) // this is required to ensure multisig accounts are only checked on networks that support them
          ) {
            // If it's not a standard account, check if the signer is a part of a Multisig
            const multisigData = await fetchMultisigDataForSigner({
              signer: starkPub,
              network,
            })

            // If the signer is not a part of multisig, the api doesn't throw an error
            // but returns an empty content array
            if (!isEmpty(multisigData.content)) {
              lastHit = lastCheck
              const {
                address: multisigAddress,
                creator,
                signers,
                threshold,
              } = multisigData.content[0]

              accounts.push({
                ...account,
                type: "multisig",
                address: multisigAddress,
              }) // add a multisig account

              await this.multisigStore.push({
                address: multisigAddress,
                networkId: network.id,
                signers,
                threshold,
                creator,
              })
            }
          }

          ++lastCheck
        }
      },
    )

    await Promise.allSettled(promises)

    try {
      const accountDetailFetchers: DetailFetchers[] = [getAccountTypesFromChain]

      if (ARGENT_SHIELD_ENABLED) {
        accountDetailFetchers.push(getAccountEscapeFromChain)
        accountDetailFetchers.push(getAccountGuardiansFromChain)
      }

      const accountsWithDetails = await getAndMergeAccountDetails(
        accounts,
        accountDetailFetchers,
      )

      const accountDetailsWithNames =
        updateAccountsWithNames(accountsWithDetails)

      await this.walletStore.push(accountDetailsWithNames)

      return accountDetailsWithNames
    } catch (error) {
      console.error(
        "Error getting account types or guardians from chain",
        error,
      )
      throw new Error(JSON.stringify(error, Object.getOwnPropertyNames(error)))
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

  public async getDefaultAccountName(
    networkId: string,
    type: CreateAccountType,
  ): Promise<string> {
    const accounts = await this.walletStore.get(withHiddenSelector)
    const pendingMultisigs = await this.pendingMultisigStore.get()

    const networkAccounts = accounts.filter(
      (account) => account.networkId === networkId,
    )

    const [multisigs, standards] = partition(
      networkAccounts,
      (account) => account.type === "multisig",
    )

    const allMultisigs = [...multisigs, ...pendingMultisigs]

    const defaultAccountName =
      type === "multisig"
        ? `Multisig ${allMultisigs.length + 1}`
        : `Account ${standards.length + 1}`

    return defaultAccountName
  }

  public async newAccount(
    networkId: string,
    type: CreateAccountType = "standard", // Should not be able to create plugin accounts. Default to argent account
    multisigPayload?: MultisigData,
  ): Promise<WalletAccount> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session) {
      throw Error("no open session")
    }

    const network = await this.getNetwork(networkId)

    const accounts = await this.walletStore.get(withHiddenSelector)
    const pendingMultisigs = await this.pendingMultisigStore.get()

    const accountsOrPendingMultisigs = [...accounts, ...pendingMultisigs]

    const currentPaths = accountsOrPendingMultisigs
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.networkId === networkId,
      )
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths, baseDerivationPath)

    let payload

    if (type === "multisig" && multisigPayload) {
      payload = await this.getDeployContractPayloadForMultisig({
        index,
        networkId,
        ...multisigPayload,
      })
    } else {
      payload = await this.getDeployContractPayloadForAccountIndex(
        index,
        networkId,
      )
    }
    const proxyClassHash = PROXY_CONTRACT_CLASS_HASHES[0]

    const proxyAddress = calculateContractAddressFromHash(
      payload.addressSalt,
      proxyClassHash,
      payload.constructorCalldata,
      0,
    )

    const defaultAccountName = await this.getDefaultAccountName(networkId, type)

    const account: WalletAccount = {
      name: defaultAccountName,
      network,
      networkId: network.id,
      address: proxyAddress,
      signer: {
        type: "local_secret" as const,
        derivationPath: getPathForIndex(index, baseDerivationPath),
      },
      type,
      needsDeploy: true,
    }

    await this.walletStore.push([account])

    if (type === "multisig" && multisigPayload) {
      await this.multisigStore.push({
        address: account.address,
        networkId: account.networkId,
        signers: multisigPayload.signers,
        threshold: multisigPayload.threshold,
        creator: multisigPayload.creator,
      })
    }

    await this.selectAccount(account)

    return account
  }

  public async deployAccount(
    walletAccount: WalletAccount,
    transactionDetails?: InvocationsDetails | undefined,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    const starknetAccount = await this.getStarknetAccount(walletAccount)

    if (!("deployAccount" in starknetAccount)) {
      throw Error("Cannot deploy old accounts")
    }

    let deployAccountPayload: DeployAccountContractPayload

    if (walletAccount.type === "multisig") {
      deployAccountPayload = await this.getMultisigDeploymentPayload(
        walletAccount,
      )
    } else {
      deployAccountPayload = await this.getAccountDeploymentPayload(
        walletAccount,
      )
    }

    const { transaction_hash } = await starknetAccount.deployAccount(
      deployAccountPayload,
      transactionDetails,
    )

    await this.selectAccount(walletAccount)

    return { account: walletAccount, txHash: transaction_hash }
  }

  public async getAccountDeploymentFee(
    walletAccount: WalletAccount,
  ): Promise<EstimateFee> {
    const starknetAccount = await this.getStarknetAccount(walletAccount)

    if (!("deployAccount" in starknetAccount)) {
      throw Error("Cannot estimate fee to deploy old accounts")
    }

    const deployAccountPayload =
      walletAccount.type === "multisig"
        ? await this.getMultisigDeploymentPayload(walletAccount)
        : await this.getAccountDeploymentPayload(walletAccount)

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

    const nonce = await getNonce(account, this)

    const deployTransaction = await provider.deployAccountContract(payload, {
      nonce,
    })
    await increaseStoredNonce(account)

    return { account, txHash: deployTransaction.transaction_hash }
  }

  /** Get the Account Deployment Payload
   * Use it in the deployAccount and getAccountDeploymentFee methods
   * @param  {WalletAccount} walletAccount
   */
  public async getAccountDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const starkPair = await this.getKeyPairByDerivationPath(
      walletAccount.signer.derivationPath,
    )

    const starkPub = ec.getStarkKey(starkPair)

    const accountClassHash = await this.getAccountClassHashForNetwork(
      walletAccount.network,
      walletAccount.type,
    )

    const constructorCallData = {
      implementation: accountClassHash,
      selector: getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
    }

    const deployAccountPayload = {
      classHash: PROXY_CONTRACT_CLASS_HASHES[0],
      contractAddress: walletAccount.address,
      constructorCalldata: stark.compileCalldata(constructorCallData),
      addressSalt: starkPub,
    }

    const calculatedAccountAddress = calculateContractAddressFromHash(
      deployAccountPayload.addressSalt,
      deployAccountPayload.classHash,
      deployAccountPayload.constructorCalldata,
      0,
    )

    if (isEqualAddress(walletAccount.address, calculatedAccountAddress)) {
      return deployAccountPayload
    }

    console.warn("Calculated address does not match account address")

    const oldCalldata = stark.compileCalldata({
      ...constructorCallData,
      implementation:
        "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f", // old implementation, ask @janek why
    })

    const oldCalculatedAddress = calculateContractAddressFromHash(
      deployAccountPayload.addressSalt,
      deployAccountPayload.classHash,
      oldCalldata,
      0,
    )

    if (isEqualAddress(oldCalculatedAddress, walletAccount.address)) {
      console.warn("Address matches old implementation")
      deployAccountPayload.constructorCalldata = oldCalldata
    } else {
      throw new Error("Calculated address does not match account address")
    }

    return deployAccountPayload
  }

  public async getMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const multisigAccount = await getMultisigAccountFromBaseWallet(
      walletAccount,
    )

    if (!multisigAccount) {
      throw new Error("This multisig account does not exist")
    }

    const starkPair = await this.getKeyPairByDerivationPath(
      multisigAccount.signer.derivationPath,
    )

    const starkPub = ec.getStarkKey(starkPair)

    const accountClassHash = await this.getAccountClassHashForNetwork(
      multisigAccount.network,
      "multisig", // make sure to always use the multisig implementation
    )

    const constructorCallData = {
      implementation: accountClassHash,
      selector: getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({
        threshold: multisigAccount.threshold.toString(),
        signers: multisigAccount.signers,
      }),
    }

    const deployMultisigPayload = {
      classHash: PROXY_CONTRACT_CLASS_HASHES[0],
      contractAddress: multisigAccount.address,
      constructorCalldata: stark.compileCalldata(constructorCallData),
      addressSalt: starkPub,
    }

    // Mostly we don't need to calculate the address,
    // but we do it here just to make sure the address is correct
    const calculatedMultisigAddress = calculateContractAddressFromHash(
      deployMultisigPayload.addressSalt,
      deployMultisigPayload.classHash,
      deployMultisigPayload.constructorCalldata,
      0,
    )

    if (!isEqualAddress(calculatedMultisigAddress, multisigAccount.address)) {
      throw new Error("Calculated address does not match multisig address")
    }

    return deployMultisigPayload
  }

  public async getDeployContractPayloadForAccountIndex(
    index: number,
    networkId: string,
  ): Promise<Required<DeployAccountContractTransaction>> {
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

    const accountClassHash = await this.getAccountClassHashForNetwork(
      network,
      "standard",
    )

    const payload = {
      classHash: accountClassHash,
      constructorCalldata: stark.compileCalldata({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({ signer: starkPub, guardian: "0" }),
      }),
      addressSalt: starkPub,
      signature: starkPair.getPrivate(),
    }

    return payload
  }

  public async getDeployContractPayloadForMultisig({
    signers,
    threshold,
    index,
    networkId,
  }: {
    threshold: number
    signers: string[]
    index: number
    networkId: string
  }): Promise<Required<DeployAccountContractTransaction>> {
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

    const accountClassHash = await this.getAccountClassHashForNetwork(
      network,
      "multisig",
    )

    const payload = {
      classHash: accountClassHash,
      constructorCalldata: stark.compileCalldata({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({
          threshold: threshold.toString(),
          signers,
        }),
      }),
      addressSalt: starkPub,
      signature: starkPair.getPrivate(),
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

  public async getMultisigAccount(
    selector: BaseWalletAccount,
  ): Promise<MultisigWalletAccount> {
    const [walletAccount] = await this.walletStore.get(
      (account) =>
        accountsEqual(account, selector) && account.type === "multisig",
    )
    if (!walletAccount) {
      throw Error("multisig wallet account not found")
    }

    const [multisigBaseWalletAccount] = await this.multisigStore.get(
      (account) => accountsEqual(account, selector),
    )

    if (!multisigBaseWalletAccount) {
      throw Error("multisig base wallet account not found")
    }

    return {
      ...walletAccount,
      ...multisigBaseWalletAccount,
      type: "multisig",
    }
  }

  public async getKeyPairByDerivationPath(derivationPath: string) {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw Error("session is not open")
    }
    return getStarkPair(derivationPath, session.secret)
  }

  public async getSignerForAccount(
    account: WalletAccount,
  ): Promise<KeyPair | SignerInterface> {
    const keyPair = await this.getKeyPairByDerivationPath(
      account.signer.derivationPath,
    )

    if (ARGENT_SHIELD_ENABLED && account.guardian) {
      const publicKey = ec.getStarkKey(keyPair)
      if (isEqualAddress(account.guardian, publicKey)) {
        /** Account guardian is the same as local signer */
        return new GuardianSelfSigner(keyPair)
      }
      return new GuardianSignerArgentX(keyPair, cosignerSign)
    }

    // Return Multisig Signer if account is multisig
    if (account.type === "multisig") {
      return new MultisigSigner(keyPair)
    }

    return keyPair
  }

  public getStarknetAccountOfType(account: Account, type: ArgentAccountType) {
    if (type === "multisig") {
      return MultisigAccount.fromAccount(account)
    }
    return account
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

    const provider = getProvider(
      account.network && account.network.baseUrl
        ? account.network
        : await this.getNetwork(selector.networkId),
    )

    const signer = await this.getSignerForAccount(account)

    if (account.needsDeploy || useLatest) {
      const starknetAccount = new Account(provider, account.address, signer)

      return this.getStarknetAccountOfType(starknetAccount, account.type)
    }

    const providerV4 = getProviderv4(
      account.network && account.network.baseUrl
        ? account.network
        : await this.getNetwork(selector.networkId),
    )

    const oldAccount = new Accountv4(providerV4, account.address, signer)

    const isOldAccount = await isNonceManagedOnAccountContract(
      oldAccount,
      account,
    )

    const starknetAccount = new Account(provider, account.address, signer)

    return isOldAccount
      ? oldAccount
      : this.getStarknetAccountOfType(starknetAccount, account.type)
  }

  public async getCurrentImplementation(
    account: WalletAccount,
  ): Promise<string> {
    const multicall = getMulticallForNetwork(account.network)

    const [implementation] = await multicall.call({
      contractAddress: account.address,
      entrypoint: "get_implementation",
    })

    return stark.makeAddress(number.toHex(number.toBN(implementation)))
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

  public async getCalculatedMultisigAddress(
    baseMultisigAccount: BaseMultisigWalletAccount,
  ): Promise<string> {
    const multisigAccount = await getMultisigAccountFromBaseWallet(
      baseMultisigAccount,
    )

    if (!multisigAccount) {
      throw new Error("This multisig account does not exist")
    }

    const starkPair = await this.getKeyPairByDerivationPath(
      multisigAccount.signer.derivationPath,
    )

    const starkPub = ec.getStarkKey(starkPair)

    const accountClassHash = await this.getAccountClassHashForNetwork(
      multisigAccount.network,
      "multisig", // make sure to always use the multisig implementation
    )

    const decodedSigners = baseMultisigAccount.signers.map((signer) =>
      utils.hexlify(utils.base58.decode(signer)),
    )

    const constructorCallData = {
      implementation: accountClassHash,
      selector: getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({
        threshold: baseMultisigAccount.threshold.toString(),
        signers: decodedSigners,
      }),
    }

    const deployMultisigPayload = {
      classHash: PROXY_CONTRACT_CLASS_HASHES[0],
      constructorCalldata: stark.compileCalldata(constructorCallData),
      addressSalt: starkPub,
    }

    return calculateContractAddressFromHash(
      deployMultisigPayload.addressSalt,
      deployMultisigPayload.classHash,
      deployMultisigPayload.constructorCalldata,
      0,
    )
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

  public async selectAccount(accountIdentifier?: BaseWalletAccount) {
    if (!accountIdentifier) {
      await this.store.set("selected", null) // Set null instead of undefinded
      return
    }

    const accounts = await this.walletStore.get()
    const account = find(accounts, (account) =>
      accountsEqual(account, accountIdentifier),
    )

    if (!account) {
      throw Error("account not found")
    }

    const { address, networkId } = account // makes sure to strip away unused properties
    await this.store.set("selected", { address, networkId })
    return account
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

  public async getPrivateKey(): Promise<string> {
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

  public async getPublicKey(
    baseAccount?: BaseWalletAccount,
  ): Promise<{ publicKey: string; account: BaseWalletAccount }> {
    const account = baseAccount
      ? await this.getAccount(baseAccount)
      : await this.getSelectedAccount()

    if (!account) {
      throw new Error("no selected account")
    }

    const starkPair = await this.getKeyPairByDerivationPath(
      account.signer.derivationPath,
    )

    const starkPub = ec.getStarkKey(starkPair)

    return { publicKey: starkPub, account }
  }

  /**
   * Given networkId, returns the next public key that will be used for a new account
   * @param networkId
   * @returns Public key
   */
  public async getNextPublicKey(
    networkId: string,
  ): Promise<{ derivationPath: string; publicKey: string }> {
    const session = await this.sessionStore.get()

    if (!session?.secret) {
      throw Error("session is not open")
    }

    const accounts = await this.walletStore.get(withHiddenSelector)
    const pendingMultisigs = await this.pendingMultisigStore.get()

    const accountsOrPendingMultisigs = [...accounts, ...pendingMultisigs]

    const currentPaths = accountsOrPendingMultisigs
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.networkId === networkId,
      )
      .sort(sortByDerivationPath)
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths, baseDerivationPath)

    const path = getPathForIndex(index, baseDerivationPath)
    const starkPair = getStarkPair(index, session?.secret, baseDerivationPath)

    return {
      derivationPath: path,
      publicKey: ec.getStarkKey(starkPair),
    }
  }

  public async newPendingMultisig(networkId: string): Promise<PendingMultisig> {
    const { derivationPath, publicKey } = await this.getNextPublicKey(networkId)

    const name = await this.getDefaultAccountName(networkId, "multisig")

    const pendingMultisig: PendingMultisig = {
      name,
      networkId,
      signer: {
        type: "local_secret",
        derivationPath,
      },
      publicKey,
      type: "multisig",
    }

    await this.pendingMultisigStore.push(pendingMultisig)

    return pendingMultisig
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
