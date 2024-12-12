import type { Address } from "@argent/x-shared"
import { addressSchema, txVersionSchema } from "@argent/x-shared"
import type {
  Abi,
  Account,
  AccountInterface,
  AllowArray,
  ArraySignatureType,
  CairoVersion,
  Call,
  DeployAccountContractPayload,
  DeployContractResponse,
  InvocationsSignerDetails,
  InvokeFunctionResponse,
  ProviderInterface,
  Signature,
  TypedData,
  UniversalDetails,
  V2InvocationsSignerDetails,
  V3InvocationsSignerDetails,
} from "starknet"
import { TransactionType, constants, hash, num, stark } from "starknet"
import { EDataAvailabilityMode } from "@starknet-io/types-js"
import { MultisigError } from "../errors/multisig"
import { ArgentSigner } from "../signer/ArgentSigner"
import type { BaseSignerInterface } from "../signer/BaseSignerInterface"
import { LedgerSigner } from "../signer/LedgerSigner"
import { BaseStarknetAccount } from "../starknetAccount/base"
import { chainIdToArgentNetwork } from "../utils/starknetNetwork"
import type { MultisigSignerSignatures } from "./multisig.model"
import type { MultisigPendingOffchainSignature } from "./pendingOffchainSignaturesStore"
import { removeMultisigPendingOffchainSignature } from "./pendingOffchainSignaturesStore"
import type { MultisigPendingTransaction } from "./pendingTransactionsStore"
import type { IMultisigBackendService } from "./service/backend/IMultisigBackendService"
import { getMultisigAccountFromBaseWallet } from "./utils/baseMultisig"
import { mapResourceBoundsToStrkBounds } from "./utils/multisigTxV3"
import { getAccountIdentifier } from "../utils/accountIdentifier"
import { addTransactionHash } from "../transactions/transactionHashes/transactionHashesRepository"

export type MultisigAccountSigner = ArgentSigner | LedgerSigner

export class MultisigAccount extends BaseStarknetAccount {
  public readonly multisigBackendService: IMultisigBackendService
  public address: Address
  public signer: MultisigAccountSigner

  private static supportedSigners = [ArgentSigner, LedgerSigner]

  constructor(
    providerOrOptions: ProviderInterface,
    address: Address,
    signer: MultisigAccountSigner,
    cairoVersion: CairoVersion = "1", // Only Cairo version 1 is supported for multisig
    classHash: string | undefined,
    multisigBackendService: IMultisigBackendService,
  ) {
    super(providerOrOptions, address, signer, cairoVersion, classHash)
    this.address = address
    this.signer = signer
    this.multisigBackendService = multisigBackendService
  }

  public static fromAccount(
    account: AccountInterface,
    signer: BaseSignerInterface,
    classHash: string | undefined,
    multisigBackendService: IMultisigBackendService,
  ): MultisigAccount {
    if (!("transactionVersion" in account)) {
      throw Error("Multisig is not supported for old accounts")
    }

    if (!this.isValidSigner(signer)) {
      throw Error(
        "Unsupported signer for MultisigAccount: " + signer.signerType,
      )
    }
    const address = addressSchema.parse(account.address)
    return new MultisigAccount(
      account,
      address,
      signer,
      "1", // Only Cairo version 1 is supported for multisig
      classHash,
      multisigBackendService,
    )
  }

  public static isMultisig(account: Account): account is MultisigAccount {
    return (
      "multisigBackendService" in account && !!account.multisigBackendService
    )
  }

  public static isValidSigner(
    signer: BaseSignerInterface,
  ): signer is MultisigAccountSigner {
    return this.supportedSigners.some((supportedSigner) =>
      supportedSigner.isValid(signer),
    )
  }

  /**
   * Executes a transaction or a batch of transactions.
   *
   * @param {AllowArray<Call>} calls - A single call or an array of calls to be executed.
   * @param {Abi[] | UniversalDetails} [abiOrDetails] - Either an array of ABIs corresponding to the calls, or a UniversalDetails object.
   * This param is required in this way to maintain backwards compatibility with the previous version of this method.
   * which use method overloading to accept either an array of ABIs or a UniversalDetails object.
   * We ignore the ABI array and use the UniversalDetails object as the transactionsDetail.
   * @param {UniversalDetails} transactionsDetail - Details about the transaction, defaults to an empty object.
   * @returns {Promise<InvokeFunctionResponse>} A promise that resolves to the response of the invoke function.
   */
  public async execute(
    calls: AllowArray<Call>,
    abiOrDetails?: Abi[] | UniversalDetails,
    transactionsDetail: UniversalDetails = {},
  ): Promise<InvokeFunctionResponse> {
    const details =
      abiOrDetails === undefined || Array.isArray(abiOrDetails)
        ? transactionsDetail
        : abiOrDetails
    const transactions = Array.isArray(calls) ? calls : [calls]
    const version = this.getTxVersion(details)

    const signerDetails =
      await this.buildInvocationSignerDetailsPayload(details)

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.INVOKE, payload: calls },
      details,
    )

    const transactionDetails = {
      ...signerDetails,
      ...estimate,
      version,
    }

    const signature = await this.signer.signTransaction(
      transactions,
      transactionDetails,
    )

    const formattedSignature = await this.prependWithPublicSigner(signature)

    return this.multisigBackendService.createTransactionRequest({
      accountId: await this.getId(signerDetails.chainId),
      address: this.address,
      calls: transactions,
      transactionDetails,
      signature: formattedSignature,
    })
  }

  public async signMessage(typedData: TypedData): Promise<Signature> {
    const signature = await this.signer.signMessage(typedData, this.address)
    const formattedSignature = await this.prependWithPublicSigner(signature)
    const chainId = await this.getChainId()

    const accountId = await this.getId(chainId)

    const signatureRequest =
      await this.multisigBackendService.createOffchainSignatureRequest({
        accountId,
        address: this.address,
        data: typedData,
        signature: formattedSignature,
        chainId,
      })

    return signatureRequest.signatures.reduce<ArraySignatureType>(
      (acc, { signer, signature }) => [
        ...acc,
        signer,
        signature.r,
        signature.s,
      ],
      [signatureRequest.id], // Add the requestId as the first element
    )
  }

  async deployAccount(
    payload: DeployAccountContractPayload,
    details: UniversalDetails = {},
  ): Promise<DeployContractResponse> {
    const version = this.getTxVersion(details)

    const signerDetails = await this.buildAccountDeploySignerDetailsPayload(
      payload,
      details,
    )

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.DEPLOY_ACCOUNT, payload },
      details,
    )
    const transactionDetails = {
      ...signerDetails,
      ...estimate,
      version,
    }
    const signature =
      await this.signer.signDeployAccountTransaction(transactionDetails)
    const formattedSignature = await this.prependWithPublicSigner(signature)
    const { classHash, addressSalt, constructorCalldata } = signerDetails

    return this.deployAccountContract(
      {
        classHash,
        addressSalt,
        constructorCalldata,
        signature: formattedSignature,
      },
      transactionDetails,
    )
  }

  public async addTransactionSignature(
    transactionToSign: MultisigPendingTransaction,
  ) {
    const chainId = await this.getChainId()

    const {
      calls,
      maxFee,
      nonce,
      version: transactionsDetailVersion,
      resource_bounds,
    } = transactionToSign.transaction
    const version = txVersionSchema.parse(transactionsDetailVersion)

    let signerDetails: InvocationsSignerDetails
    if (
      (version === constants.TRANSACTION_VERSION.V3 ||
        version === constants.TRANSACTION_VERSION.F3) &&
      resource_bounds
    ) {
      signerDetails = {
        walletAddress: this.address,
        nonce,
        chainId,
        version,
        cairoVersion: this.cairoVersion,
        resourceBounds: mapResourceBoundsToStrkBounds(resource_bounds),
        // using default values for the rest of the fields
        tip: num.toBigInt(0),
        paymasterData: [],
        accountDeploymentData: [],
        feeDataAvailabilityMode: EDataAvailabilityMode.L1,
        nonceDataAvailabilityMode: EDataAvailabilityMode.L1,
      } as V3InvocationsSignerDetails
    } else {
      signerDetails = {
        walletAddress: this.address,
        chainId,
        nonce,
        version,
        cairoVersion: this.cairoVersion,
        maxFee,
      } as V2InvocationsSignerDetails
    }

    await addTransactionHash(
      transactionToSign.requestId,
      transactionToSign.transactionHash,
    )

    const signature = await this.signer.signTransaction(calls, signerDetails)
    const formattedSignature = await this.prependWithPublicSigner(signature)
    const accountId = await this.getId(chainId)

    return this.multisigBackendService.addTransactionSignature({
      accountId,
      address: this.address,
      transactionToSign,
      chainId,
      signature: formattedSignature,
    })
  }

  public async addOffchainSignature(
    pendingOffchainSignature: MultisigPendingOffchainSignature,
  ): Promise<MultisigSignerSignatures> {
    const chainId = await this.getChainId()

    const signature = await this.signer.signMessage(
      pendingOffchainSignature.message.content,
      this.address,
    )

    const formattedSignature = await this.prependWithPublicSigner(signature)

    const accountId = await this.getId(chainId)

    const { signatures } =
      await this.multisigBackendService.addOffchainSignature({
        accountId,
        address: this.address,
        pendingOffchainSignature,
        chainId,
        signature: formattedSignature,
      })

    return signatures
  }

  public async waitForOffchainSignatures(
    pendingOffchainSignature: MultisigPendingOffchainSignature,
  ): Promise<MultisigSignerSignatures> {
    const chainId = await this.getChainId()

    const account = pendingOffchainSignature.account
    const multisig = await getMultisigAccountFromBaseWallet(account)

    if (!multisig) {
      throw new MultisigError({ code: "MULTISIG_ACCOUNT_NOT_FOUND" })
    }

    let signatures = pendingOffchainSignature.signatures,
      isApproved = false

    while (!isApproved) {
      const { content } =
        await this.multisigBackendService.fetchMultisigSignatureRequestById({
          address: this.address,
          requestId: pendingOffchainSignature.requestId,
          chainId,
        })

      if (content.approvedSigners.length >= multisig.threshold) {
        isApproved = true
        signatures = content.signatures
      } else if (content.state === "CANCELLED") {
        // This means that the request was cancelled by the creator and should break the loop
        throw new MultisigError({ code: "SIGNATURE_REQUEST_CANCELLED" })
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    // Once the signatures are approved, remove the pending offchain signature
    await removeMultisigPendingOffchainSignature(pendingOffchainSignature)

    return signatures
  }

  public async cancelOffchainSignature(
    pendingOffchainSignature: MultisigPendingOffchainSignature,
  ): Promise<void> {
    const chainId = await this.getChainId()
    // Pedersen hash of the state and the message hash
    // pedersen(starknet_keccak(state), msg_hash)
    const stateMsghash = hash.computePedersenHash(
      hash.starknetKeccak("CANCELLED"),
      pendingOffchainSignature.messageHash,
    )
    const signature = await this.signer.signRawMsgHash(stateMsghash)
    const formattedSignature = await this.prependWithPublicSigner(signature)
    await this.multisigBackendService.cancelOffchainSignature({
      address: this.address,
      chainId,
      pendingOffchainSignature,
      signature: formattedSignature,
    })
  }

  async prependWithPublicSigner(signature: Signature): Promise<Signature> {
    const publicSigner = await this.signer.getPubKey()
    return [publicSigner, ...stark.signatureToHexArray(signature)]
  }

  private async getId(providedChainId?: constants.StarknetChainId) {
    const chainId = providedChainId ?? (await this.getChainId())

    const signer = {
      type: this.signer.signerType,
      derivationPath: this.signer.derivationPath, // because both ArgentSigner and LedgerSigner have this property
    }

    return getAccountIdentifier(
      this.address,
      chainIdToArgentNetwork(chainId),
      signer,
    )
  }
}
