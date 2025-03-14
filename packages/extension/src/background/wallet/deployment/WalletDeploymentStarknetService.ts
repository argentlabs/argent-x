import type { Address, Hex, Implementation } from "@argent/x-shared"
import {
  addressSchema,
  AddSmartAcountRequestSchema,
  estimatedFeeToMaxResourceBounds,
  findImplementationForAccount,
  getAccountDeploymentPayload,
  getTxVersionFromFeeToken,
  hexSchema,
  isContractDeployed,
  isEqualAddress,
} from "@argent/x-shared"
import type {
  DeployAccountContractTransaction,
  EstimateFeeDetails,
} from "starknet"
import { CallData, hash, stark, TransactionType } from "starknet"
import { getMultisigAccountFromBaseWallet } from "../../../shared/multisig/utils/baseMultisig"
import { getProvider } from "../../../shared/network/provider"
import type { INetworkService } from "../../../shared/network/service/INetworkService"
import type { IRepository } from "../../../shared/storage/__new/interface"
import type {
  ArgentWalletAccount,
  BaseMultisigWalletAccount,
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  WalletAccount,
} from "../../../shared/wallet.model"
import { SignerType } from "../../../shared/wallet.model"

import type { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"

import { stringToBytes } from "@scure/base"
import { keccak, pedersen } from "micro-starknet"
import type { BigNumberish } from "starknet"
import { constants, num } from "starknet"
import type { AnalyticsService } from "../../../shared/analytics/AnalyticsService"
import { AccountError } from "../../../shared/errors/account"
import { SessionError } from "../../../shared/errors/session"
import { WalletError } from "../../../shared/errors/wallet"
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
} from "../../../shared/network/constants"
import { addBackendAccount } from "../../../shared/smartAccount/backend/account"
import { getPathForIndex } from "../../../shared/utils/derivationPath"
import type { IReferralService } from "../../services/referral/IReferralService"
import type { WalletAccountStarknetService } from "../account/WalletAccountStarknetService"
import type { WalletBackupService } from "../backup/WalletBackupService"
import type { WalletCryptoStarknetService } from "../crypto/WalletCryptoStarknetService"
import type { WalletSessionService } from "../session/WalletSessionService"
import type {
  DeployAccountContractPayload,
  IWalletDeploymentService,
} from "./IWalletDeploymentService"

import type { EstimatedFee, EstimatedFeeV2 } from "@argent/x-shared/simulation"
import type { BaseSignerInterface } from "../../../shared/signer/BaseSignerInterface"
import { getBaseDerivationPath } from "../../../shared/signer/utils"
import {
  deserializeAccountIdentifier,
  getAccountIdentifier,
} from "../../../shared/utils/accountIdentifier"
import { getAccountMeta } from "../../../shared/accountNameGenerator"
import { sanitizeAccountType } from "../../../shared/utils/sanitizeAccountType"
import { sanitizeSignerType } from "../../../shared/utils/sanitizeSignerType"
import { ArgentSigner } from "../../../shared/signer"
import { addEstimatedFee } from "../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { TransactionError } from "../../../shared/errors/transaction"
import type { ISecretStorageService } from "../session/interface"

const { calculateContractAddressFromHash } = hash

function mapVersionToFeeToken(version: BigNumberish): Address {
  if (
    num.toBigInt(version) === num.toBigInt(constants.TRANSACTION_VERSION.V1) ||
    num.toBigInt(version) === num.toBigInt(constants.TRANSACTION_VERSION.F1)
  ) {
    return ETH_TOKEN_ADDRESS
  }
  if (
    num.toBigInt(version) === num.toBigInt(constants.TRANSACTION_VERSION.V3) ||
    num.toBigInt(version) === num.toBigInt(constants.TRANSACTION_VERSION.F3)
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
    private readonly sessionService: WalletSessionService,
    public readonly secretStorageService: ISecretStorageService,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly accountStarknetService: WalletAccountStarknetService,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly backupService: WalletBackupService,
    private readonly networkService: Pick<INetworkService, "getById">,
    private readonly ampli: AnalyticsService,
    private readonly referralService: IReferralService,
  ) {}

  public async deployAccount(
    walletAccount: ArgentWalletAccount,
    transactionDetails?: EstimateFeeDetails | undefined,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    const { payload, details, account } = await this.buildDeploymentPayload(
      walletAccount,
      transactionDetails,
    )
    const { transaction_hash } = await account.deployAccount(payload, details)

    const { signer } = deserializeAccountIdentifier(walletAccount.id)

    this.ampli.accountDeployed({
      "account index": signer.index,
      "account type": sanitizeAccountType(walletAccount.type),
      "wallet platform": "browser extension",
    })
    await this.accountSharedService.selectAccount(walletAccount.id)

    return { account: walletAccount, txHash: transaction_hash }
  }

  public async getDeployAccountTransactionHash(
    walletAccount: ArgentWalletAccount,
    transactionDetails?: EstimateFeeDetails | undefined,
  ): Promise<Hex> {
    const { account, payload, details } = await this.buildDeploymentPayload(
      walletAccount,
      transactionDetails,
    )

    const hash = await account.getAccountDeployTransactionHash(payload, details)
    return hexSchema.parse(hash)
  }

  public async getAccountOrMultisigDeploymentPayload(
    walletAccount: ArgentWalletAccount,
  ) {
    if (walletAccount.type === "multisig") {
      return this.getMultisigDeploymentPayload(walletAccount)
    }
    return this.getAccountDeploymentPayload(walletAccount)
  }

  public async getAccountDeploymentFee(
    walletAccount: ArgentWalletAccount,
    feeTokenAddress: Address,
  ): Promise<EstimatedFeeV2> {
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount(walletAccount.id)

    if (!("deployAccount" in starknetAccount)) {
      throw new AccountError({ code: "CANNOT_ESTIMATE_DEPLOY_OLD_ACCOUNTS" })
    }

    const deployAccountPayload =
      await this.getAccountOrMultisigDeploymentPayload(walletAccount)

    const version = getTxVersionFromFeeToken(feeTokenAddress)

    const { gas_consumed, gas_price, data_gas_consumed, data_gas_price } =
      await starknetAccount.estimateAccountDeployFee(deployAccountPayload, {
        skipValidate: true,
        version,
      })

    if (!gas_consumed || !gas_price) {
      throw new AccountError({
        code: "CANNOT_ESTIMATE_TRANSACTIONS",
      })
    }

    const fees = {
      feeTokenAddress,
      amount: gas_consumed,
      pricePerUnit: gas_price,
      dataGasConsumed: data_gas_consumed,
      dataGasPrice: data_gas_price,
    }

    await addEstimatedFee(
      { type: "native", transactions: fees },
      { type: TransactionType.DEPLOY_ACCOUNT, payload: deployAccountPayload },
    )
    return {
      ...fees,
      type: "native",
    }
  }

  /** Get the Account Deployment Payload
   * Use it in the deployAccount and getAccountDeploymentFee methods
   * @param  {ArgentWalletAccount} walletAccount
   */
  public async getAccountDeploymentPayload(
    walletAccount: ArgentWalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const { id, address, network, type, guardian, salt } = walletAccount

    const { publicKey } = await this.cryptoStarknetService.getPublicKey(id)

    // If no class hash is provided by the account, we want to add the network implementation to check
    const networkImplementation: Implementation = {
      cairoVersion: "1",
      accountClassHash:
        await this.cryptoStarknetService.getAccountClassHashForNetwork(
          network,
          type,
        ),
    }

    const { accountClassHash, cairoVersion } = findImplementationForAccount(
      publicKey,
      walletAccount,
      [networkImplementation],
    )

    const payload = getAccountDeploymentPayload(
      cairoVersion,
      accountClassHash,
      publicKey,
      guardian,
      salt,
    )

    return {
      ...payload,
      version: cairoVersion,
      contractAddress: address,
    }
  }

  public async getMultisigDeploymentPayload(
    walletAccount: ArgentWalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const multisigAccount =
      await getMultisigAccountFromBaseWallet(walletAccount)

    if (!multisigAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }

    const { id, address, network, threshold, signers } = multisigAccount

    const { publicKey } = await this.cryptoStarknetService.getPublicKey(id)
    let addressSalt = publicKey

    // cIndex refers to corrupted index
    // This should be removed in future asap
    if (
      "cIndex" in multisigAccount &&
      typeof multisigAccount.cIndex === "number"
    ) {
      const corruptDerivationPath =
        multisigAccount.signer.derivationPath.slice(0, -1) +
        multisigAccount.cIndex

      addressSalt =
        await this.cryptoStarknetService.getPubKeyByDerivationPathForSigner(
          multisigAccount.signer.type,
          corruptDerivationPath,
        )
    }

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
      addressSalt,
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
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)
    const path = getPathForIndex(
      index,
      getBaseDerivationPath("standard", SignerType.LOCAL_SECRET),
    )
    const pubKey =
      await this.cryptoStarknetService.getArgentPubKeyByDerivationPath(path)

    const accountClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "standardCairo0",
      )

    return getAccountDeploymentPayload("0", accountClassHash, pubKey)
  }

  public async getDeployContractPayloadForAccountIndex(
    index: number,
    signerType: SignerType,
    networkId: string,
  ): Promise<Omit<Required<DeployAccountContractTransaction>, "signature">> {
    const hasSession = await this.sessionService.isSessionOpen()
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)
    const path = getPathForIndex(
      index,
      getBaseDerivationPath("standard", signerType),
    )
    const pubKey =
      await this.cryptoStarknetService.getPubKeyByDerivationPathForSigner(
        signerType,
        path,
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
    networkId,
    publicKey,
  }: {
    threshold: number
    signers: string[]
    networkId: string
    publicKey: string
  }): Promise<Omit<Required<DeployAccountContractTransaction>, "signature">> {
    const hasSession = await this.sessionService.isSessionOpen()
    const initialised = await this.backupService.isInitialized()

    if (!initialised) {
      throw new WalletError({ code: "NOT_INITIALIZED" })
    }
    if (!hasSession) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const network = await this.networkService.getById(networkId)

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
      addressSalt: publicKey,
    }

    return payload
  }

  private async getNewAccountDeploymentPayload(
    type: CreateAccountType,
    signerType: SignerType,
    index: number,
    networkId: string,
    multisigPayload: MultisigData | undefined,
  ) {
    let payload: Omit<Required<DeployAccountContractTransaction>, "signature">

    if (type === "multisig" && multisigPayload) {
      payload = await this.getDeployContractPayloadForMultisig({
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
        signerType,
        networkId,
      )
    }

    return payload
  }

  public async newAccount(
    networkId: string,
    accountType: CreateAccountType = "standard", // Should not be able to create plugin accounts. Default to argent account
    signerType: SignerType = SignerType.LOCAL_SECRET,
    multisigPayload?: MultisigData,
  ): Promise<CreateWalletAccount> {
    const decrypted = await this.secretStorageService.decrypt()
    if (!decrypted) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const { secret } = decrypted

    const network = await this.networkService.getById(networkId)

    let index, derivationPath, publicKey

    if (
      multisigPayload &&
      multisigPayload.index !== undefined &&
      multisigPayload.derivationPath !== undefined &&
      multisigPayload.publicKey !== undefined
    ) {
      index = multisigPayload.index
      derivationPath = multisigPayload.derivationPath
      publicKey = multisigPayload.publicKey
    } else {
      const nextSigner = await this.cryptoStarknetService.getNextPublicKey(
        accountType,
        signerType,
        networkId,
      )
      index = nextSigner.index
      derivationPath = nextSigner.derivationPath
      publicKey = nextSigner.publicKey
    }

    const payload = await this.getNewAccountDeploymentPayload(
      accountType,
      signerType,
      index,
      networkId,
      multisigPayload,
    )

    let accountAddress: string
    let guardianAddress: string | undefined
    let salt: string | undefined

    if (accountType === "smart") {
      const _signer = new ArgentSigner(secret, derivationPath) // used temporarily to sign the account creation
      const signature = await _signer.signRawMsgHash(
        pedersen(keccak(stringToBytes("utf8", "starknet")), publicKey),
      )

      const [r, s] = stark.signatureToHexArray(signature)

      const addSmartAccountRequest = AddSmartAcountRequestSchema.parse({
        implClassHash: addressSchema.parse(payload.classHash),
        signature: { r, s },
        ownerAddress: publicKey,
        network: network.id,
      })

      const addSmartAccountResponse = await addBackendAccount(
        addSmartAccountRequest,
      )
      accountAddress = addSmartAccountResponse.address
      guardianAddress = addSmartAccountResponse.guardianAddress
      salt = addSmartAccountResponse.account.salt
    } else {
      accountAddress = calculateContractAddressFromHash(
        payload.addressSalt,
        payload.classHash,
        payload.constructorCalldata,
        0,
      )
    }

    const isDeployed = await isContractDeployed(
      getProvider(network),
      accountAddress,
    )

    const signer = {
      type: signerType,
      derivationPath,
    }

    const accountId = getAccountIdentifier(accountAddress, networkId, signer)
    const { name } = getAccountMeta(accountId, accountType)

    const account: CreateWalletAccount = {
      id: accountId,
      name,
      network,
      networkId: network.id,
      address: accountAddress,
      signer,
      type: accountType,
      classHash: addressSchema.parse(payload.classHash), // This is only true for new Cairo 1 accounts. For Cairo 0, this is the proxy contract class hash
      cairoVersion: accountType === "standardCairo0" ? "0" : "1",
      needsDeploy: !isDeployed,
      ...(accountType === "smart" && { guardian: guardianAddress }),
      index,
      ...(salt && { salt: addressSchema.parse(salt) }),
    }

    await this.walletStore.upsert([account])

    if (accountType === "multisig" && multisigPayload) {
      await this.multisigStore.upsert({
        id: account.id,
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

    await this.accountSharedService.selectAccount(account.id)
    this.ampli.accountCreated({
      "account index": index,
      "account type": sanitizeAccountType(accountType),
      "signer type": sanitizeSignerType(signerType),
      "wallet platform": "browser extension",
    })
    if (accountType === "smart") {
      await this.accountSharedService.sendAccountLabelToBackend({
        address: account.address,
        name: account.name,
        networkId: account.networkId,
      })
    }

    // TODO: check if also want it for ledger
    if (signerType === SignerType.LOCAL_SECRET) {
      const signer = await this.cryptoStarknetService.getSigner(
        account.id,
        account.type,
      )
      await this.trackReferral(account, signer)
    }
    return account
  }

  private async buildDeploymentPayload(
    walletAccount: ArgentWalletAccount,
    transactionDetails?: EstimateFeeDetails | undefined,
  ) {
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount(walletAccount.id)

    if (!starknetAccount) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    if (!("deployAccount" in starknetAccount)) {
      throw new AccountError({ code: "CANNOT_DEPLOY_OLD_ACCOUNTS" })
    }

    const deployAccountPayload =
      await this.getAccountOrMultisigDeploymentPayload(walletAccount)

    let maxFeeOrBounds = {}

    if (transactionDetails?.maxFee || transactionDetails?.resourceBounds) {
      maxFeeOrBounds = {
        maxFee: transactionDetails.maxFee,
        resourceBounds: transactionDetails.resourceBounds,
      }
    } else {
      const deploymentFee = await this.getAccountDeploymentFee(
        walletAccount,
        mapVersionToFeeToken(transactionDetails?.version ?? "0x1"),
      )

      if (deploymentFee.type === "paymaster") {
        throw new TransactionError({ code: "PAYMASTER_FEES_NOT_SUPPORTED" })
      }

      maxFeeOrBounds = estimatedFeeToMaxResourceBounds(deploymentFee)
    }

    const details = {
      ...transactionDetails,
      ...maxFeeOrBounds,
    }

    return {
      account: starknetAccount,
      payload: deployAccountPayload,
      details,
    }
  }

  private async trackReferral(
    account: WalletAccount,
    signer: BaseSignerInterface,
  ) {
    const { publicKey } = await this.cryptoStarknetService.getPublicKey(
      account.id,
    )
    const hash = pedersen(keccak(stringToBytes("utf8", "referral")), publicKey)
    const signature = await signer.signRawMsgHash(hash)
    return this.referralService.trackReferral({
      accountAddress: account.address,
      ownerAddress: publicKey,
      signature: stark.signatureToHexArray(signature),
    })
  }
}
