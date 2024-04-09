import {
  Address,
  addressSchema,
  isAccountV5,
  isContractDeployed,
  isEqualAddress,
} from "@argent/x-shared"
import {
  CallData,
  DeployAccountContractTransaction,
  EstimateFeeDetails,
  hash,
} from "starknet6"

import { withHiddenSelector } from "../../../shared/account/selectors"
import { PendingMultisig } from "../../../shared/multisig/types"
import { getMultisigAccountFromBaseWallet } from "../../../shared/multisig/utils/baseMultisig"
import { getProvider } from "../../../shared/network/provider"
import { INetworkService } from "../../../shared/network/service/interface"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import {
  BaseMultisigWalletAccount,
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  WalletAccount,
} from "../../../shared/wallet.model"

import { WalletAccountSharedService } from "../../../shared/account/service/shared.service"

import {
  MULTISIG_DERIVATION_PATH,
  STANDARD_DERIVATION_PATH,
} from "../../../shared/wallet.service"
import { getIndexForPath, getStarkPair } from "../../keys/keyDerivation"
import {
  getNextPathIndex,
  getPathForIndex,
} from "../../../shared/utils/derivationPath"
import { getNonce, increaseStoredNonce } from "../../nonce"
import { WalletAccountStarknetService } from "../account/starknet.service"
import { WalletBackupService } from "../backup/backup.service"
import { WalletCryptoStarknetService } from "../crypto/starknet.service"
import { WalletSessionService } from "../session/session.service"
import type { WalletSession } from "../session/walletSession.model"
import {
  IWalletDeploymentService,
  DeployAccountContractPayload,
} from "./interface"
import { SessionError } from "../../../shared/errors/session"
import { WalletError } from "../../../shared/errors/wallet"
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
} from "../../../shared/network/constants"
import { AccountError } from "../../../shared/errors/account"
import { EstimatedFee } from "../../../shared/transactionSimulation/fees/fees.model"
import { estimatedFeeToMaxResourceBounds } from "../../../shared/transactionSimulation/utils"
import { BigNumberish, num, constants } from "starknet"
import { getTxVersionFromFeeToken } from "../../../shared/utils/getTransactionVersion"
import {
  Implementation,
  findImplementationForAccount,
  getAccountDeploymentPayload,
} from "../findImplementationForAddress"
import { AnalyticsService } from "../../../shared/analytics/implementation"

const { calculateContractAddressFromHash } = hash

// TODO: import from starknet6 when available
const BN_TRANSACTION_VERSION_3 = 3n
const BN_FEE_TRANSACTION_VERSION_3 = 2n ** 128n + BN_TRANSACTION_VERSION_3

function mapVersionToFeeToken(version: BigNumberish): Address {
  if (
    num.toBigInt(version) === constants.BN_TRANSACTION_VERSION_1 ||
    num.toBigInt(version) === constants.BN_FEE_TRANSACTION_VERSION_1
  ) {
    return ETH_TOKEN_ADDRESS
  }
  if (
    num.toBigInt(version) === BN_TRANSACTION_VERSION_3 ||
    num.toBigInt(version) === BN_FEE_TRANSACTION_VERSION_3
  ) {
    return STRK_TOKEN_ADDRESS
  }
  throw new Error("Unsupported tx version for fee token mapping")
}

export class WalletDeploymentStarknetService
  implements IWalletDeploymentService
{
  constructor(
    private readonly walletStore: IRepository<WalletAccount>,
    private readonly multisigStore: IRepository<BaseMultisigWalletAccount>,
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly sessionService: WalletSessionService,
    public readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly accountStarknetService: WalletAccountStarknetService,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly backupService: WalletBackupService,
    private readonly networkService: Pick<INetworkService, "getById">,
    private readonly analyticsService: AnalyticsService,
  ) {}

  public async deployAccount(
    walletAccount: WalletAccount,
    transactionDetails?: EstimateFeeDetails | undefined,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount(walletAccount)

    if (!("deployAccount" in starknetAccount)) {
      throw new AccountError({ code: "CANNOT_DEPLOY_OLD_ACCOUNTS" })
    }

    const deployAccountPayload =
      await this.getAccountOrMultisigDeploymentPayload(walletAccount)

    if (!isAccountV5(starknetAccount)) {
      throw new AccountError({ code: "CANNOT_DEPLOY_OLD_ACCOUNTS" })
    }

    const maxFeeOrBounds =
      transactionDetails?.maxFee || transactionDetails?.resourceBounds
        ? {
            maxFee: transactionDetails?.maxFee,
            resourceBounds: transactionDetails?.resourceBounds,
          }
        : estimatedFeeToMaxResourceBounds(
            await this.getAccountDeploymentFee(
              walletAccount,
              mapVersionToFeeToken(transactionDetails?.version ?? "0x1"),
            ),
          )

    const { transaction_hash } = await starknetAccount.deployAccount(
      deployAccountPayload,
      {
        ...transactionDetails,
        ...maxFeeOrBounds,
      },
    )
    const baseDerivationPath =
      walletAccount.type === "multisig"
        ? MULTISIG_DERIVATION_PATH
        : STANDARD_DERIVATION_PATH
    this.analyticsService.accountDeployed({
      "account index": getIndexForPath(
        walletAccount.signer.derivationPath,
        baseDerivationPath,
      ).toString(),
      "account type": walletAccount.type,
    })
    await this.accountSharedService.selectAccount(walletAccount)

    return { account: walletAccount, txHash: transaction_hash }
  }

  public async getAccountOrMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ) {
    if (walletAccount.type === "multisig") {
      return this.getMultisigDeploymentPayload(walletAccount)
    }
    return this.getAccountDeploymentPayload(walletAccount)
  }

  public async getAccountDeploymentFee(
    walletAccount: WalletAccount,
    feeTokenAddress: Address,
  ): Promise<EstimatedFee> {
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount(walletAccount)

    if (!("deployAccount" in starknetAccount)) {
      throw new AccountError({ code: "CANNOT_ESTIMATE_DEPLOY_OLD_ACCOUNTS" })
    }

    const deployAccountPayload =
      await this.getAccountOrMultisigDeploymentPayload(walletAccount)

    if (!isAccountV5(starknetAccount)) {
      throw new AccountError({
        code: "CANNOT_ESTIMATE_FEE_OLD_ACCOUNTS_DEPLOYMENT",
      })
    }

    const version = getTxVersionFromFeeToken(feeTokenAddress)

    const { gas_consumed, gas_price } =
      await starknetAccount.estimateAccountDeployFee(deployAccountPayload, {
        skipValidate: true,
        version,
      })

    if (!gas_consumed || !gas_price) {
      throw new AccountError({
        code: "CANNOT_ESTIMATE_TRANSACTIONS",
      })
    }

    return {
      feeTokenAddress,
      amount: gas_consumed,
      pricePerUnit: gas_price,
    }
  }

  public async redeployAccount(account: WalletAccount) {
    if (!(await this.sessionService.isSessionOpen())) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount({
        address: account.address,
        networkId: account.networkId,
      })
    const nonce = await getNonce(account, starknetAccount)

    const deployTransaction = await this.deployAccount(account, { nonce })

    await increaseStoredNonce(account)

    return { account, txHash: deployTransaction.txHash }
  }

  /** Get the Account Deployment Payload
   * Use it in the deployAccount and getAccountDeploymentFee methods
   * @param  {WalletAccount} walletAccount
   */
  public async getAccountDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const starkPair =
      await this.cryptoStarknetService.getKeyPairByDerivationPath(
        walletAccount.signer.derivationPath,
      )

    const starkPub = starkPair.pubKey

    // If no class hash is provided by the account, we want to add the network implementation to check
    const networkImplementation: Implementation = {
      cairoVersion: "1",
      accountClassHash:
        await this.cryptoStarknetService.getAccountClassHashForNetwork(
          walletAccount.network,
          walletAccount.type,
        ),
    }

    const { accountClassHash, cairoVersion } = findImplementationForAccount(
      starkPub,
      walletAccount,
      [networkImplementation],
    )

    return {
      ...getAccountDeploymentPayload(cairoVersion, accountClassHash, starkPub),
      version: cairoVersion,
      contractAddress: walletAccount.address,
    }
  }

  public async getMultisigDeploymentPayload(
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const multisigAccount =
      await getMultisigAccountFromBaseWallet(walletAccount)

    if (!multisigAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }

    const { address, network, signer, threshold, signers } = multisigAccount

    const starkPair =
      await this.cryptoStarknetService.getKeyPairByDerivationPath(
        signer.derivationPath,
      )

    const starkPub = starkPair.pubKey

    const accountClassHash =
      multisigAccount.classHash ??
      (await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "multisig", // make sure to always use the multisig implementation
      ))

    const deployMultisigPayload = {
      classHash: accountClassHash,
      contractAddress: address,
      constructorCalldata: CallData.compile({
        threshold, // Initial threshold
        signers, // Initial signers
      }),
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

    if (!isEqualAddress(calculatedMultisigAddress, address)) {
      throw new AccountError({ code: "CALCULATED_ADDRESS_NO_MATCH" })
    }

    return { ...deployMultisigPayload, version: "1" }
  }

  // TODO: remove this once testing of cairo 1 is done
  public async getDeployContractPayloadForAccountIndexCairo0(
    index: number,
    networkId: string,
  ): Promise<Omit<Required<DeployAccountContractTransaction>, "signature">> {
    const hasSession = await this.sessionService.isSessionOpen()
    const session = await this.sessionStore.get()
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession || !session) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)
    const { pubKey } = getStarkPair(
      index,
      session?.secret,
      STANDARD_DERIVATION_PATH,
    )

    const accountClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "standardCairo0",
      )

    return getAccountDeploymentPayload("0", accountClassHash, pubKey)
  }

  public async getDeployContractPayloadForAccountIndex(
    index: number,
    networkId: string,
  ): Promise<Omit<Required<DeployAccountContractTransaction>, "signature">> {
    const hasSession = await this.sessionService.isSessionOpen()
    const session = await this.sessionStore.get()
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession || !session) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)
    const { pubKey } = getStarkPair(
      index,
      session?.secret,
      STANDARD_DERIVATION_PATH,
    )

    const accountClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "standard",
      )

    return getAccountDeploymentPayload("1", accountClassHash, pubKey)
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
  }): Promise<Omit<Required<DeployAccountContractTransaction>, "signature">> {
    const hasSession = await this.sessionService.isSessionOpen()
    const session = await this.sessionStore.get()
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession || !session) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)
    const { pubKey } = getStarkPair(
      index,
      session?.secret,
      MULTISIG_DERIVATION_PATH,
    )

    const accountClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "multisig",
      )

    const payload = {
      classHash: accountClassHash,
      constructorCalldata: CallData.compile({
        threshold, // Initial threshold
        signers, // Initial signers
      }),
      addressSalt: pubKey,
    }

    return payload
  }

  public async newAccount(
    networkId: string,
    type: CreateAccountType = "standard", // Should not be able to create plugin accounts. Default to argent account
    multisigPayload?: MultisigData,
  ): Promise<CreateWalletAccount> {
    const session = await this.sessionStore.get()
    if (!(await this.sessionService.isSessionOpen()) || !session) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)

    const accounts = await this.walletStore.get(withHiddenSelector)

    const pendingMultisigs = await this.pendingMultisigStore.get()

    const accountsOrPendingMultisigs = [...accounts, ...pendingMultisigs]

    const baseDerivationPath =
      type === "multisig" ? MULTISIG_DERIVATION_PATH : STANDARD_DERIVATION_PATH

    const currentPaths = accountsOrPendingMultisigs
      .filter(
        (account) =>
          account.signer.type === "local_secret" &&
          account.signer.derivationPath.startsWith(baseDerivationPath) && // filters out invalid account types
          account.networkId === networkId,
      )
      .map((account) => account.signer.derivationPath)

    const index = getNextPathIndex(currentPaths, baseDerivationPath)

    let payload: Omit<Required<DeployAccountContractTransaction>, "signature">

    if (type === "multisig" && multisigPayload) {
      payload = await this.getDeployContractPayloadForMultisig({
        index,
        networkId,
        ...multisigPayload,
      })
    } else if (type === "standardCairo0") {
      payload = await this.getDeployContractPayloadForAccountIndexCairo0(
        index,
        networkId,
      )
    } else {
      payload = await this.getDeployContractPayloadForAccountIndex(
        index,
        networkId,
      )
    }

    const accountAddress = calculateContractAddressFromHash(
      payload.addressSalt,
      payload.classHash,
      payload.constructorCalldata,
      0,
    )

    const defaultAccountName =
      type === "multisig" ? `Multisig ${index + 1}` : `Account ${index + 1}`

    const isDeployed = await isContractDeployed(
      getProvider(network),
      accountAddress,
    )

    const account: CreateWalletAccount = {
      name: defaultAccountName,
      network,
      networkId: network.id,
      address: accountAddress,
      signer: {
        type: "local_secret" as const,
        derivationPath: getPathForIndex(index, baseDerivationPath),
      },
      type,
      classHash: addressSchema.parse(payload.classHash), // This is only true for new Cairo 1 accounts. For Cairo 0, this is the proxy contract class hash
      cairoVersion: type === "standardCairo0" ? "0" : "1",
      needsDeploy: !isDeployed,
      index,
    }

    await this.walletStore.upsert([account])

    if (type === "multisig" && multisigPayload) {
      await this.multisigStore.upsert({
        address: account.address,
        networkId: account.networkId,
        signers: multisigPayload.signers,
        threshold: multisigPayload.threshold,
        creator: multisigPayload.creator,
        publicKey: multisigPayload.publicKey,
        updatedAt: Date.now(),
        index,
      })
    }

    await this.accountSharedService.selectAccount(account)

    return account
  }
}
