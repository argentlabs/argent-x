import {
  Hex,
  Implementation,
  findImplementationForAccount,
  hexSchema,
} from "@argent/x-shared"
import { CairoVersion, CallData, hash } from "starknet"
import { withHiddenSelector } from "../../../shared/account/selectors"
import { PendingMultisig } from "../../../shared/multisig/types"
import {
  WalletAccount,
  BaseWalletAccount,
  BaseMultisigWalletAccount,
  ArgentAccountType,
  SignerType,
  WalletAccountSigner,
  CreateAccountType,
} from "../../../shared/wallet.model"
import {
  getIndexForPath,
  getNextPathIndex,
  getPathForIndex,
} from "../../../shared/utils/derivationPath"
import { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { getMultisigAccountFromBaseWallet } from "../../../shared/multisig/utils/baseMultisig"
import type { WalletSession } from "../session/walletSession.model"
import { Network } from "../../../shared/network"
import {
  getPreDeployedAccount,
  declareContracts,
} from "../../devnet/declareAccounts"
import { LoadContracts } from "../loadContracts"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import {
  decodeBase58Array,
  getLatestArgentAccountClassHash,
} from "@argent/x-shared"
import { SessionError } from "../../../shared/errors/session"
import { AccountError } from "../../../shared/errors/account"
import { C0_PROXY_CONTRACT_CLASS_HASHES } from "../../../shared/account/starknet.constants"
import { ArgentSigner } from "../../../shared/signer/ArgentSigner"
import { BaseSignerInterface } from "../../../shared/signer/BaseSignerInterface"
import { getBaseDerivationPath } from "../../../shared/signer/utils"
import { ILedgerSharedService } from "../../../shared/ledger/service/ILedgerSharedService"
const { getSelectorFromName, calculateContractAddressFromHash } = hash

export class WalletCryptoStarknetService {
  constructor(
    private readonly walletStore: IRepository<WalletAccount>,
    private readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly ledgerService: ILedgerSharedService,
    private readonly loadContracts: LoadContracts,
  ) {}

  public async getArgentPubKeyByDerivationPath(derivationPath: string) {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const signer = new ArgentSigner(session.secret, derivationPath)
    return signer.getPubKey()
  }

  public getLedgerPubKeyByDerivationPath(derivationPath: string) {
    return this.ledgerService.getPubKey(derivationPath)
  }

  public getPubKeyByDerivationPathForSigner(
    signerType: SignerType,
    derivationPath: string,
  ) {
    switch (signerType) {
      case SignerType.LOCAL_SECRET:
        return this.getArgentPubKeyByDerivationPath(derivationPath)
      case SignerType.LEDGER:
        return this.getLedgerPubKeyByDerivationPath(derivationPath)
      default:
        throw new Error(`Unsupported signer type: ${signerType}`)
    }
  }

  public getSignerForAccount(account: WalletAccount) {
    return this.getSigner(account.signer)
  }

  public async getSigner(
    signer: WalletAccountSigner,
  ): Promise<BaseSignerInterface> {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const { type, derivationPath } = signer

    switch (type) {
      case SignerType.LOCAL_SECRET:
        return new ArgentSigner(session.secret, derivationPath)
      case SignerType.LEDGER:
        return this.ledgerService.getSigner(derivationPath)
      default:
        throw new Error("Unsupported signer type")
    }
  }

  public async getPrivateKey(
    baseWalletAccount: BaseWalletAccount,
  ): Promise<string> {
    const session = await this.sessionStore.get()
    if (session === null || !session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const account =
      await this.accountSharedService.getAccount(baseWalletAccount)

    if (!account) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    const signer = await this.getSignerForAccount(account)

    return signer.getPrivateKey()
  }

  public async getPublicKey(
    baseAccount?: BaseWalletAccount,
  ): Promise<{ publicKey: string; account: BaseWalletAccount }> {
    const account = baseAccount
      ? await this.accountSharedService.getAccount(baseAccount)
      : await this.accountSharedService.getSelectedAccount()

    if (!account) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    const signer = await this.getSignerForAccount(account)
    const publicKey = await signer.getPubKey()

    return { publicKey, account }
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

    const currentPaths = accountsOrPendingMultisigs
      .filter(
        (account) =>
          account.signer.type === signerType && account.networkId === networkId,
      )
      .map((account) => account.signer.derivationPath)

    const baseDerivationPath = getBaseDerivationPath(accountType, signerType)
    const usedIndices = currentPaths.map((path) =>
      getIndexForPath(path, baseDerivationPath),
    )
    const nextIndex = getNextPathIndex(currentPaths, baseDerivationPath)
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
    const account = await this.accountSharedService.getAccount(baseAccount)

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

    const { publicKey } = await this.getPublicKey(account)

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

    const { publicKey } = await this.getPublicKey(multisigAccount)

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
}
