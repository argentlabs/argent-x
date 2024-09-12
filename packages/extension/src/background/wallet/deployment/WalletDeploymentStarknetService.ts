import {
  Address,
  Implementation,
  addressSchema,
  findImplementationForAccount,
  getAccountDeploymentPayload,
  isContractDeployed,
  isEqualAddress,
  getTxVersionFromFeeToken,
  estimatedFeeToMaxResourceBounds,
  AddSmartAcountRequestSchema,
} from "@argent/x-shared"
import {
  CallData,
  DeployAccountContractTransaction,
  EstimateFeeDetails,
  hash,
  stark,
} from "starknet"
import { PendingMultisig } from "../../../shared/multisig/types"
import { getMultisigAccountFromBaseWallet } from "../../../shared/multisig/utils/baseMultisig"
import { getProvider } from "../../../shared/network/provider"
import { INetworkService } from "../../../shared/network/service/INetworkService"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import {
  BaseMultisigWalletAccount,
  CreateAccountType,
  CreateWalletAccount,
  MultisigData,
  SignerType,
  WalletAccount,
} from "../../../shared/wallet.model"

import { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"

import { stringToBytes } from "@scure/base"
import { keccak, pedersen } from "micro-starknet"
import { BigNumberish, constants, num } from "starknet"
import { AnalyticsService } from "../../../shared/analytics/AnalyticsService"
import { AccountError } from "../../../shared/errors/account"
import { SessionError } from "../../../shared/errors/session"
import { WalletError } from "../../../shared/errors/wallet"
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
} from "../../../shared/network/constants"
import { addBackendAccount } from "../../../shared/smartAccount/backend/account"
import {
  getIndexForPath,
  getPathForIndex,
} from "../../../shared/utils/derivationPath"
import { getNonce, increaseStoredNonce } from "../../nonce"
import { WalletAccountStarknetService } from "../account/WalletAccountStarknetService"
import { WalletBackupService } from "../backup/WalletBackupService"
import { WalletCryptoStarknetService } from "../crypto/WalletCryptoStarknetService"
import { IReferralService } from "../../services/referral/IReferralService"
import { WalletSessionService } from "../session/WalletSessionService"
import type { WalletSession } from "../session/walletSession.model"
import {
  DeployAccountContractPayload,
  IWalletDeploymentService,
} from "./IWalletDeploymentService"

import { EstimatedFee } from "@argent/x-shared/simulation"
import { getBaseDerivationPath } from "../../../shared/signer/utils"
import { BaseSignerInterface } from "../../../shared/signer/BaseSignerInterface"
import { sanitizeAccountType } from "../../../shared/utils/sanitizeAccountType"
import { sanitizeSignerType } from "../../../shared/utils/sanitizeSignerType"

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
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly sessionService: WalletSessionService,
    public readonly sessionStore: IObjectStore<WalletSession | null>,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly accountStarknetService: WalletAccountStarknetService,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly backupService: WalletBackupService,
    private readonly networkService: Pick<INetworkService, "getById">,
    private readonly ampli: AnalyticsService,
    private readonly referralService: IReferralService,
  ) {}

  public async deployAccount(
    walletAccount: WalletAccount,
    transactionDetails?: EstimateFeeDetails | undefined,
  ): Promise<{ account: WalletAccount; txHash: string }> {
    const starknetAccount =
      await this.accountStarknetService.getStarknetAccount(walletAccount)

    if (!starknetAccount) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    if (!("deployAccount" in starknetAccount)) {
      throw new AccountError({ code: "CANNOT_DEPLOY_OLD_ACCOUNTS" })
    }

    const deployAccountPayload =
      await this.getAccountOrMultisigDeploymentPayload(walletAccount)

    const estimatedFees = estimatedFeeToMaxResourceBounds(
      await this.getAccountDeploymentFee(
        walletAccount,
        mapVersionToFeeToken(transactionDetails?.version ?? "0x1"),
      ),
    )

    const maxFeeOrBounds =
      transactionDetails?.maxFee || transactionDetails?.resourceBounds
        ? {
            maxFee: transactionDetails?.maxFee,
            resourceBounds: transactionDetails?.resourceBounds,
          }
        : estimatedFees

    const { transaction_hash } = await starknetAccount.deployAccount(
      deployAccountPayload,
      {
        ...transactionDetails,
        ...maxFeeOrBounds,
      },
    )
    const baseDerivationPath = getBaseDerivationPath(
      walletAccount.type !== "multisig" ? "standard" : "multisig",
      walletAccount.signer.type,
    )
    this.ampli.accountDeployed({
      "account index": getIndexForPath(
        walletAccount.signer.derivationPath,
        baseDerivationPath,
      ),
      "account type": sanitizeAccountType(walletAccount.type),
      "wallet platform": "browser extension",
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

    return {
      feeTokenAddress,
      amount: gas_consumed,
      pricePerUnit: gas_price,
      dataGasConsumed: data_gas_consumed,
      dataGasPrice: data_gas_price,
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
    const { address, network, signer, type, guardian, salt } = walletAccount

    const publicKey =
      await this.cryptoStarknetService.getPubKeyByDerivationPathForSigner(
        signer.type,
        signer.derivationPath,
      )

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
    walletAccount: WalletAccount,
  ): Promise<Required<DeployAccountContractPayload>> {
    const multisigAccount =
      await getMultisigAccountFromBaseWallet(walletAccount)

    if (!multisigAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }

    const { address, network, signer, threshold, signers } = multisigAccount

    const starkPub =
      await this.cryptoStarknetService.getPubKeyByDerivationPathForSigner(
        signer.type,
        signer.derivationPath,
      )

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
    index,
    networkId,
    signerType,
  }: {
    threshold: number
    signers: string[]
    index: number
    networkId: string
    signerType: SignerType
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
    const path = getPathForIndex(
      index,
      getBaseDerivationPath("multisig", signerType),
    )
    const pubKey =
      await this.cryptoStarknetService.getPubKeyByDerivationPathForSigner(
        signerType,
        path,
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
        index,
        signerType,
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
    const network = await this.networkService.getById(networkId)

    const { index, derivationPath, publicKey } =
      await this.cryptoStarknetService.getNextPublicKey(
        accountType,
        signerType,
        networkId,
      )

    const payload = await this.getNewAccountDeploymentPayload(
      accountType,
      signerType,
      index,
      networkId,
      multisigPayload,
    )

    const signer = await this.cryptoStarknetService.getSigner({
      type: signerType,
      derivationPath,
    })

    let accountAddress: string
    let guardianAddress: string | undefined
    let salt: string | undefined

    if (accountType === "smart") {
      const signature = await signer.signRawMsgHash(
        pedersen(keccak(stringToBytes("utf8", "starknet")), publicKey),
      )

      const [r, s] = stark.signatureToHexArray(signature)

      const addSmartAccountRequest = AddSmartAcountRequestSchema.parse({
        implClassHash: addressSchema.parse(payload.classHash),
        signature: { r, s },
        ownerAddress: publicKey,
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

    const nonMultisigAccounts = await this.walletStore.get(
      (acc) => acc.networkId === networkId && acc.type !== "multisig",
    )

    const multisigAccounts = await this.walletStore.get(
      (acc) => acc.networkId === networkId && acc.type === "multisig",
    )

    const defaultAccountName =
      accountType === "multisig"
        ? `Multisig ${multisigAccounts.length + 1}`
        : `Account ${nonMultisigAccounts.length + 1}`

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
        type: signerType,
        derivationPath,
      },
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
    this.ampli.accountCreated({
      "account index": index,
      "account type": sanitizeAccountType(accountType),
      "signer type": sanitizeSignerType(signerType),
      "wallet platform": "browser extension",
    })
    if (accountType === "smart") {
      await this.accountSharedService.sendAccountNameToBackend({
        address: account.address,
        name: account.name,
      })
    }

    // TODO: check if also want it for ledger
    if (signerType === "local_secret") {
      await this.trackReferral(account, signer)
    }
    return account
  }

  private async trackReferral(
    account: WalletAccount,
    signer: BaseSignerInterface,
  ) {
    const { publicKey } = await this.cryptoStarknetService.getPublicKey(account)
    const hash = pedersen(keccak(stringToBytes("utf8", "referral")), publicKey)
    const signature = await signer.signRawMsgHash(hash)
    return this.referralService.trackReferral({
      accountAddress: account.address,
      ownerAddress: publicKey,
      signature: stark.signatureToHexArray(signature),
    })
  }
}
