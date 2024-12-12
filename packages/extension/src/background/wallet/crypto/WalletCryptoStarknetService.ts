import type { Hex, Implementation } from "@argent/x-shared"
import {
  decodeBase58Array,
  ensureArray,
  findImplementationForAccount,
  getLatestArgentAccountClassHash,
  hexSchema,
} from "@argent/x-shared"
import type { CairoVersion } from "starknet"
import { CallData, hash } from "starknet"
import { withHiddenSelector } from "../../../shared/account/selectors"
import type { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { C0_PROXY_CONTRACT_CLASS_HASHES } from "../../../shared/account/starknet.constants"
import { AccountError } from "../../../shared/errors/account"
import { SessionError } from "../../../shared/errors/session"
import type { ILedgerSharedService } from "../../../shared/ledger/service/ILedgerSharedService"
import type { PendingMultisig } from "../../../shared/multisig/types"
import { getMultisigAccountFromBaseWallet } from "../../../shared/multisig/utils/baseMultisig"
import type { Network } from "../../../shared/network"
import { ArgentSigner } from "../../../shared/signer/ArgentSigner"
import type { BaseSignerInterface } from "../../../shared/signer/BaseSignerInterface"
import {
  getBaseDerivationPath,
  getDerivationPathForIndex,
} from "../../../shared/signer/utils"
import type {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import {
  getIndexForPath,
  getPathForIndex,
} from "../../../shared/utils/derivationPath"
import type {
  AccountId,
  ArgentAccountType,
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  CreateAccountType,
  WalletAccount,
  WalletAccountType,
} from "../../../shared/wallet.model"
import { SignerType } from "../../../shared/wallet.model"
import {
  declareContracts,
  getPreDeployedAccount,
} from "../../devnet/declareAccounts"
import type { LoadContracts } from "../loadContracts"
import type { WalletSession } from "../session/walletSession.model"
import { PrivateKeySigner } from "../../../shared/signer/PrivateKeySigner"
import { deserializeAccountIdentifier } from "../../../shared/utils/accountIdentifier"
import type { IPKManager } from "../../../shared/accountImport/pkManager/IPKManager"
import memoize, { type Memoized } from "memoizee"

const { getSelectorFromName, calculateContractAddressFromHash } = hash

type PublicKeyGetter = (
  account: WalletAccount,
) => Promise<{ publicKey: string; account: WalletAccount }>

export class WalletCryptoStarknetService {
  private memoizedGetPublicKey: PublicKeyGetter & Memoized<PublicKeyGetter>

  constructor(
    private readonly walletStore: IRepository<WalletAccount>,
    private readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly ledgerService: ILedgerSharedService,
    private readonly pkManager: IPKManager,
    private readonly loadContracts: LoadContracts,
  ) {
    this.memoizedGetPublicKey = memoize(this._getPublicKey.bind(this), {
      promise: true,
      normalizer: ([account]) => account.id,
    })
  }

  public async getArgentPubKeyByDerivationPath(derivationPath: string) {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const signer = new ArgentSigner(session.secret, derivationPath)
    return signer.getPubKey()
  }

  public getPubKeyByDerivationPathForSigner(
    signerType: SignerType,
    derivationPath: string,
  ) {
    switch (signerType) {
      case SignerType.LOCAL_SECRET:
        return this.getArgentPubKeyByDerivationPath(derivationPath)
      case SignerType.LEDGER:
        return this.ledgerService.getPubKey(derivationPath)
      default:
        throw new Error(`Unsupported signer type: ${signerType}`)
    }
  }

  public getSignerForAccount({ id, type }: Pick<WalletAccount, "id" | "type">) {
    return this.getSigner(id, type)
  }

  public async getSigner(
    accountId: AccountId,
    type: WalletAccountType,
  ): Promise<BaseSignerInterface> {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const { signer } = deserializeAccountIdentifier(accountId)
    const derivationPath = getDerivationPathForIndex(
      signer.index,
      signer.type,
      type,
    )
    switch (signer.type) {
      case SignerType.LOCAL_SECRET:
        return new ArgentSigner(session.secret, derivationPath)
      case SignerType.LEDGER:
        return this.ledgerService.getSigner(derivationPath)
      case SignerType.PRIVATE_KEY: {
        const pk = await this.pkManager.retrieveDecryptedKey(
          session.password,
          accountId,
        )
        return new PrivateKeySigner(pk)
      }
      default:
        throw new Error("Unsupported signer type")
    }
  }

  public async getPrivateKey(accountId: AccountId): Promise<string> {
    const session = await this.sessionStore.get()
    if (session === null || !session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const account = await this.accountSharedService.getAccount(accountId)

    if (!account) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    const signer = await this.getSignerForAccount(account)

    return signer.getPrivateKey()
  }

  public async getPublicKey(accountId?: string) {
    const account = accountId
      ? await this.accountSharedService.getAccount(accountId)
      : await this.accountSharedService.getSelectedAccount()

    if (!account) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    return this.memoizedGetPublicKey(account)
  }

  /**
   * Given networkId, returns the next public key that will be used for a new account
   * @param networkId
   * @returns Public key
   */
  public async getNextPublicKey(
    accountType: CreateAccountType,
    signerType: SignerType,
    networkId: string,
  ): Promise<{ index: number; derivationPath: string; publicKey: string }> {
    const session = await this.sessionStore.get()

    if (!session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const accounts = await this.walletStore.get(withHiddenSelector)

    // can be multisig or standard accounts
    const filteredAccounts = accounts.filter(
      (account) =>
        (accountType === "multisig") === (account.type === "multisig"), // both are multisig or both are not
    )

    const pendingMultisigs = await this.pendingMultisigStore.get()

    const accountsOrPendingMultisigs = [
      ...filteredAccounts,
      ...pendingMultisigs,
    ]

    const derivationPathsBySignerType = accountsOrPendingMultisigs
      .filter((account) => account.networkId === networkId)
      .reduce(
        (acc, account) => {
          const { type, derivationPath } = account.signer

          if (!acc[type]) {
            acc[type] = []
          }

          acc[type].push(derivationPath)
          return acc
        },
        {} as Record<SignerType, string[]>,
      )

    const baseDerivationPath = getBaseDerivationPath(accountType, signerType)
    const usedIndices = ensureArray(
      derivationPathsBySignerType[signerType],
    ).map((path) => getIndexForPath(path, baseDerivationPath))

    // We consider all signers when determining the next available index to ensure that any changes in signers are accounted for, preventing the reuse of an index linked to a previously assigned address, which would result in a duplicate.
    const nextIndex = accountsOrPendingMultisigs.length

    const path = getPathForIndex(nextIndex, baseDerivationPath)

    switch (signerType) {
      case SignerType.LOCAL_SECRET: {
        const publicKey = await this.getArgentPubKeyByDerivationPath(path)

        return {
          index: nextIndex,
          derivationPath: path,
          publicKey,
        }
      }

      case SignerType.LEDGER: {
        const { pubKey, index } =
          await this.ledgerService.getNextAvailablePublicKey(
            accountType,
            nextIndex,
            usedIndices,
            networkId,
          )
        return {
          index,
          derivationPath: getPathForIndex(index, baseDerivationPath),
          publicKey: pubKey,
        }
      }

      default:
        throw new Error(`Unsupported signer type: ${signerType}`)
    }
  }

  /**
   * Given networkId, returns the next public key that will be used for a new account
   * @param networkId
   * @returns Public key
   */
  public async getNextPublicKeyForMultisig(
    networkId: string,
    signerType: SignerType,
  ): Promise<{ index: number; derivationPath: string; publicKey: string }> {
    return this.getNextPublicKey("multisig", signerType, networkId)
  }

  public async getNextPublicKeyForStandardAccount(
    networkId: string,
    signerType: SignerType,
  ): Promise<{ index: number; derivationPath: string; publicKey: string }> {
    return this.getNextPublicKey("standard", signerType, networkId)
  }

  /**
   * Given start and buffer, returns an array of public keys
   * @param start Start index
   * @param buffer Number of public keys to return
   * @returns String array of public keys
   */
  public async getPublicKeysBufferForMultisig(
    start: number,
    buffer: number,
  ): Promise<string[]> {
    const session = await this.sessionStore.get()

    if (!session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const keys = ArgentSigner.generatePublicKeys(
      session.secret,
      start,
      buffer,
      getBaseDerivationPath("multisig", SignerType.LOCAL_SECRET),
    )

    return keys.map(({ pubKey }) => pubKey)
  }

  async getAccountClassHashForNetwork(
    network: Network,
    accountType: ArgentAccountType,
  ): Promise<Hex> {
    if (network.accountClassHash && network.accountClassHash.standard) {
      const classHash =
        network.accountClassHash[accountType] ??
        network.accountClassHash.standard
      return hexSchema.parse(classHash)
    }

    const deployerAccount = await getPreDeployedAccount(network)
    if (deployerAccount) {
      const accountClassHash = await declareContracts(
        network,
        deployerAccount,
        this.loadContracts,
      )

      return hexSchema.parse(accountClassHash)
    }

    return hexSchema.parse(getLatestArgentAccountClassHash())
  }

  public async getUndeployedAccountCairoVersion(
    baseAccount: BaseWalletAccount,
  ): Promise<CairoVersion> {
    const account = await this.accountSharedService.getArgentAccount(
      baseAccount.id,
    )

    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    if (!account.needsDeploy) {
      throw new AccountError({
        code: "ACCOUNT_ALREADY_DEPLOYED",
        message:
          "Account is already deployed. Please use getAccountCairoVersion function to get the Cairo Version of the account",
      })
    }

    if (account.type === "multisig") {
      return "1" // multisig is always Cairo 1
    }

    const { publicKey } = await this.getPublicKey(account.id)

    // If no class hash is provided by the account, we want to add the network implementation to check
    const networkImplementation: Implementation = {
      cairoVersion: "1",
      accountClassHash: await this.getAccountClassHashForNetwork(
        account.network,
        account.type,
      ),
    }

    try {
      const { cairoVersion } = findImplementationForAccount(
        publicKey,
        account,
        [networkImplementation],
      )
      return cairoVersion
    } catch (error) {
      console.error(error)
      throw new AccountError({
        code: "UNDEPLOYED_ACCOUNT_CAIRO_VERSION_NOT_FOUND",
        options: { error },
      })
    }
  }

  public async getCalculatedMultisigAddress(
    baseMultisigAccount: BaseMultisigWalletAccount,
  ): Promise<string> {
    const multisigAccount =
      await getMultisigAccountFromBaseWallet(baseMultisigAccount)

    if (!multisigAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }

    const { publicKey } = await this.getPublicKey(multisigAccount.id)

    const accountClassHash =
      multisigAccount.classHash ??
      (await this.getAccountClassHashForNetwork(
        multisigAccount.network,
        "multisig", // make sure to always use the multisig implementation
      ))

    const decodedSigners = decodeBase58Array(multisigAccount.signers)

    const constructorCallData = {
      implementation: accountClassHash,
      selector: getSelectorFromName("initialize"),
      calldata: CallData.compile({
        threshold: baseMultisigAccount.threshold.toString(),
        signers: decodedSigners,
      }),
    }

    const deployMultisigPayload = {
      classHash: C0_PROXY_CONTRACT_CLASS_HASHES[0],
      constructorCalldata: CallData.compile(constructorCallData),
      addressSalt: publicKey,
    }

    return calculateContractAddressFromHash(
      deployMultisigPayload.addressSalt,
      deployMultisigPayload.classHash,
      deployMultisigPayload.constructorCalldata,
      0,
    )
  }

  private async _getPublicKey(account: WalletAccount) {
    const signer = await this.getSignerForAccount(account)
    const publicKey = await signer.getPubKey()
    return { publicKey, account }
  }
}
