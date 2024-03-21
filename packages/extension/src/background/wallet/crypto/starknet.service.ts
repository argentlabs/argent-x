import { Hex, isEqualAddress } from "@argent/x-shared"
import { CairoVersion, CallData, hash } from "starknet"
import { withHiddenSelector } from "../../../shared/account/selectors"
import { MultisigSigner } from "../../../shared/multisig/signer"
import { PendingMultisig } from "../../../shared/multisig/types"
import { GuardianSelfSigner } from "../../../shared/shield/GuardianSelfSigner"
import { GuardianSignerArgentX } from "../../../shared/shield/GuardianSignerArgentX"
import { cosignerSign } from "../../../shared/shield/backend/account"
import {
  WalletAccount,
  BaseWalletAccount,
  BaseMultisigWalletAccount,
  ArgentAccountType,
} from "../../../shared/wallet.model"
import { getStarkPair, generatePublicKeys } from "../../keys/keyDerivation"
import {
  getNextPathIndex,
  getPathForIndex,
} from "../../../shared/utils/derivationPath"

import { WalletAccountSharedService } from "../../../shared/account/service/shared.service"
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
import { decodeBase58Array } from "@argent/x-shared"
import { MULTISIG_DERIVATION_PATH } from "../../../shared/wallet.service"
import { sortMultisigByDerivationPath } from "../../../shared/utils/accountsMultisigSort"
import { SessionError } from "../../../shared/errors/session"
import { getAccountCairoVersion } from "../../../shared/utils/argentAccountVersion"
import { AccountError } from "../../../shared/errors/account"
import {
  ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES,
  C0_PROXY_CONTRACT_CLASS_HASHES,
} from "../../../shared/account/starknet.constants"
import {
  Implementation,
  findImplementationForAccount,
} from "../findImplementationForAddress"
const { getSelectorFromName, calculateContractAddressFromHash } = hash

export class WalletCryptoStarknetService {
  constructor(
    private readonly walletStore: IRepository<WalletAccount>,
    private readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly loadContracts: LoadContracts,
  ) {}

  public async getKeyPairByDerivationPath(derivationPath: string) {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    return getStarkPair(derivationPath, session.secret)
  }

  public async getSignerForAccount(account: WalletAccount) {
    const keyPair = await this.getKeyPairByDerivationPath(
      account.signer.derivationPath,
    )

    const publicKey = keyPair.pubKey
    const pk = keyPair.getPrivate()

    // Keep the fallback here as we don't want to block the users
    // if the worker has not updated the account yet
    let cairoVersion =
      account.cairoVersion ??
      (await getAccountCairoVersion(
        account.address,
        account.network,
        account.type,
      ))

    if (!cairoVersion && account.needsDeploy) {
      cairoVersion = await this.getUndeployedAccountCairoVersion(account)
    }

    if (!cairoVersion) {
      throw new AccountError({
        code: "DEPLOYED_ACCOUNT_CAIRO_VERSION_NOT_FOUND",
      })
    }

    if (account.guardian) {
      if (isEqualAddress(account.guardian, publicKey)) {
        /** Account guardian is the same as local signer */
        return new GuardianSelfSigner(pk)
      }
      return new GuardianSignerArgentX(pk, cosignerSign, cairoVersion)
    }

    // Return Multisig Signer if account is multisig
    if (account.type === "multisig") {
      return new MultisigSigner(pk)
    }

    return keyPair
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
      ? await this.accountSharedService.getAccount(baseAccount)
      : await this.accountSharedService.getSelectedAccount()

    if (!account) {
      throw new AccountError({ code: "NOT_SELECTED" })
    }

    const starkPair = await this.getKeyPairByDerivationPath(
      account.signer.derivationPath,
    )

    return { publicKey: starkPair.pubKey, account }
  }

  /**
   * Given networkId, returns the next public key that will be used for a new account
   * @param networkId
   * @returns Public key
   */
  public async getNextPublicKeyForMultisig(
    networkId: string,
  ): Promise<{ index: number; derivationPath: string; publicKey: string }> {
    const session = await this.sessionStore.get()

    if (!session?.secret) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const accounts = await this.walletStore.get(withHiddenSelector)

    const multisigs = accounts.filter((account) => account.type === "multisig")

    const pendingMultisigs = await this.pendingMultisigStore.get()

    const multisigsOrPendingMultisigs = [...multisigs, ...pendingMultisigs]

    const currentPaths = multisigsOrPendingMultisigs
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.signer.derivationPath.startsWith(MULTISIG_DERIVATION_PATH) && // just to be sure
          account.networkId === networkId,
      )
      .sort(sortMultisigByDerivationPath)
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths, MULTISIG_DERIVATION_PATH)

    const path = getPathForIndex(index, MULTISIG_DERIVATION_PATH)
    const starkPair = getStarkPair(
      index,
      session?.secret,
      MULTISIG_DERIVATION_PATH,
    )

    return {
      index,
      derivationPath: path,
      publicKey: starkPair.pubKey,
    }
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

    const keys = generatePublicKeys(
      session.secret,
      start,
      buffer,
      MULTISIG_DERIVATION_PATH,
    )

    return keys.map(({ pubKey }) => pubKey)
  }

  async getAccountClassHashForNetwork(
    network: Network,
    accountType: ArgentAccountType,
  ): Promise<Hex> {
    if (network.accountClassHash && network.accountClassHash.standard) {
      return (network.accountClassHash[accountType] ??
        network.accountClassHash.standard) as Hex
    }

    const deployerAccount = await getPreDeployedAccount(network)
    if (deployerAccount) {
      const { accountClassHash } = await declareContracts(
        network,
        deployerAccount,
        this.loadContracts,
      )

      return accountClassHash as Hex
    }

    return ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES.CAIRO_1[0] as Hex
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

    const starkPair = await this.getKeyPairByDerivationPath(
      multisigAccount.signer.derivationPath,
    )

    const starkPub = starkPair.pubKey

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
      addressSalt: starkPub,
    }

    return calculateContractAddressFromHash(
      deployMultisigPayload.addressSalt,
      deployMultisigPayload.classHash,
      deployMultisigPayload.constructorCalldata,
      0,
    )
  }
}
