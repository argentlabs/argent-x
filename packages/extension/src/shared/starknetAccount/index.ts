import {
  Abi,
  AccountInterface,
  AllowArray,
  ArraySignatureType,
  CairoVersion,
  Call,
  DeclareContractPayload,
  DeclareContractResponse,
  DeployAccountContractPayload,
  DeployContractResponse,
  ProviderInterface,
  Signature,
  TransactionType,
  TypedData,
  UniversalDetails,
  constants,
  isSierra,
  provider,
  stark,
  transaction,
} from "starknet"
import { BaseSignerInterface } from "../signer/BaseSignerInterface"
import { ArgentSigner, LedgerSigner } from "../signer"
import { Address, addressSchema, txVersionSchema } from "@argent/x-shared"
import { BaseStarknetAccount } from "./base"

export class StarknetAccount extends BaseStarknetAccount {
  // Static registry of supported signer types
  private static supportedSigners = [ArgentSigner, LedgerSigner]

  constructor(
    provider: ProviderInterface,
    address: Address,
    public signer: ArgentSigner | LedgerSigner,
    cairoVersion: CairoVersion,
    classHash: string | undefined,
  ) {
    super(provider, address, signer, cairoVersion, classHash)
  }

  async deployAccount(
    payload: DeployAccountContractPayload,
    details: UniversalDetails = {},
  ): Promise<DeployContractResponse> {
    const version = txVersionSchema.parse(details.version)
    const signerDetails = await this.buildAccountDeploySignerDetailsPayload(
      payload,
      details,
    )

    const estimate = await this.getUniversalSuggestedFee(
      version,
      {
        type: TransactionType.DEPLOY_ACCOUNT,
        payload,
      },
      details,
    )
    const transactionDetails = {
      ...signerDetails,
      ...estimate,
      version,
    }

    const ownerSignature =
      await this.signer.signDeployAccountTransaction(transactionDetails)

    const signature = await this.processSignature(ownerSignature)

    const { classHash, addressSalt, constructorCalldata } = signerDetails

    return this.deployAccountContract(
      {
        classHash,
        addressSalt,
        constructorCalldata,
        signature,
      },
      transactionDetails,
    )
  }

  public async execute(
    calls: AllowArray<Call>,
    abiOrDetails?: Abi[] | UniversalDetails,
    transactionsDetail: UniversalDetails = {},
  ): Promise<{ transaction_hash: string }> {
    const details =
      abiOrDetails === undefined || Array.isArray(abiOrDetails)
        ? transactionsDetail
        : abiOrDetails
    const transactions = Array.isArray(calls) ? calls : [calls]
    const version = txVersionSchema.parse(details.version)
    const signerDetails =
      await this.buildInvocationSignerDetailsPayload(details)

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.INVOKE, payload: calls },
      details,
    )

    const cairoVersion = await this.getCairoVersion()

    const transactionDetails = {
      ...signerDetails,
      ...estimate,
      version,
    }

    const ownerSignature = await this.signer.signTransaction(
      transactions,
      transactionDetails,
    )

    const calldata = transaction.getExecuteCalldata(transactions, cairoVersion)

    const signature = await this.processSignature(ownerSignature)

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      transactionDetails,
    )
  }

  public static fromAccount(
    account: AccountInterface,
    signer: BaseSignerInterface,
    classHash: string | undefined,
  ) {
    if (!this.isValidSigner(signer)) {
      throw new Error(
        "Unsupported signer for StarknetAccount: " + signer.signerType,
      )
    }
    const address = addressSchema.parse(account.address)
    return new StarknetAccount(
      account,
      address,
      signer,
      account.cairoVersion,
      classHash,
    )
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    const ownerSignature = await this.signer.signMessage(
      typedData,
      this.address,
    )

    return this.processSignature(ownerSignature)
  }

  public async declare(
    payload: DeclareContractPayload,
    details: UniversalDetails = {},
  ): Promise<DeclareContractResponse> {
    const version = isSierra(payload.contract) // Means Cairo1 contract which supports txV2 and v3
      ? txVersionSchema.parse(details.version)
      : constants.TRANSACTION_VERSION.V1 // Cairo0 contract which only supports txV1

    const signerDetails = await this.buildDeclareSignerDetailsPayload(
      payload,
      details,
    )

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.DECLARE, payload },
      details,
    )
    const transactionDetails = {
      ...signerDetails,
      ...estimate,
      compiledClassHash: signerDetails.compiledClassHash as string, // TS, cast because optional for v2 and required for v3, thrown if not present
      version,
    }

    const ownerSig =
      await this.signer.signDeclareTransaction(transactionDetails)

    const signature = await this.processSignature(ownerSig)
    const compressedCompiledContract = provider.parseContract(payload.contract)

    return this.declareContract(
      {
        contract: compressedCompiledContract,
        senderAddress: this.address,
        compiledClassHash: transactionDetails.compiledClassHash,
        signature,
      },
      transactionDetails,
    )
  }

  async processSignature(signature: Signature): Promise<ArraySignatureType> {
    if (this.supportsMultiSigner()) {
      const signer = await this.signer.getPubKey()
      const starknetSignature = this.buildStarknetSignature(signer, signature)
      return this.prependWithSignatureLength(starknetSignature)
    }
    return stark.signatureToDecimalArray(signature)
  }

  public static isValidSigner(
    signer: BaseSignerInterface,
  ): signer is ArgentSigner | LedgerSigner {
    return this.supportedSigners.some((supportedSigner) =>
      supportedSigner.isValid(signer),
    )
  }
}
