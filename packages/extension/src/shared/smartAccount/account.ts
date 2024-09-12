import {
  Abi,
  AccountInterface,
  AllowArray,
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
import {
  Address,
  addressSchema,
  isEqualAddress,
  txVersionSchema,
} from "@argent/x-shared"
import { ArgentSigner, GuardianSignerV2 } from "../signer"
import { Cosigner } from "@argent/x-guardian"
import { BaseStarknetAccount } from "../starknetAccount/base"
import { isEmpty } from "lodash-es"

export class SmartAccount extends BaseStarknetAccount {
  signer: ArgentSigner

  // Static registry of supported signer types
  private static supportedSigners = [ArgentSigner]

  constructor(
    provider: ProviderInterface,
    address: Address,
    signer: ArgentSigner,
    cairoVersion: CairoVersion,
    public guardian: ArgentSigner | GuardianSignerV2,
    classHash: string | undefined,
  ) {
    super(provider, address, signer, cairoVersion, classHash)
    this.signer = signer
  }

  public static fromAccount(
    account: AccountInterface,
    owner: BaseSignerInterface,
    classHash: string | undefined,
    guardianPubKey: string | undefined,
    cosignerImpl: Cosigner,
  ) {
    if (!this.isValidSigner(owner)) {
      throw new Error(
        "Unsupported signer for SmartAccount: " + owner.signerType,
      )
    }
    const address = addressSchema.parse(account.address)
    const guardianSigner =
      guardianPubKey && !isEqualAddress(owner.getStarkKey(), guardianPubKey)
        ? new GuardianSignerV2(
            cosignerImpl,
            guardianPubKey,
            account.cairoVersion,
          )
        : owner

    return new SmartAccount(
      account,
      address,
      owner,
      account.cairoVersion,
      guardianSigner,
      classHash,
    )
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    const ownerSignature = await this.signer.signMessage(
      typedData,
      this.address,
    )
    const guardianSignature = await this.guardian.signMessage(
      typedData,
      this.address,
    )

    return this.mergeOwnerGuardianSignatures(ownerSignature, guardianSignature)
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

    const guardianSignature = await this.guardian.signTransaction(
      transactions,
      transactionDetails,
    )

    const calldata = transaction.getExecuteCalldata(transactions, cairoVersion)

    const signature = await this.mergeOwnerGuardianSignatures(
      ownerSignature,
      guardianSignature,
    )

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature },
      transactionDetails,
    )
  }

  public async deployAccount(
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

    const ownerSig =
      await this.signer.signDeployAccountTransaction(transactionDetails)
    const guardianSig =
      await this.guardian.signDeployAccountTransaction(transactionDetails)

    const signature = await this.mergeOwnerGuardianSignatures(
      ownerSig,
      guardianSig,
    )
    const { classHash, addressSalt, constructorCalldata } = signerDetails

    return this.deployAccountContract(
      { classHash, addressSalt, constructorCalldata, signature },
      transactionDetails,
    )
  }

  public async declare(
    payload: DeclareContractPayload,
    details: UniversalDetails = {},
  ): Promise<DeclareContractResponse> {
    const version = !isSierra(payload.contract)
      ? txVersionSchema.parse(details.version)
      : constants.TRANSACTION_VERSION.V1

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
    const guardianSig =
      await this.guardian.signDeclareTransaction(transactionDetails)

    const signature = await this.mergeOwnerGuardianSignatures(
      ownerSig,
      guardianSig,
    )
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

  async mergeOwnerGuardianSignatures(
    ownerSignature: Signature,
    guardianSignature: Signature,
  ): Promise<Signature> {
    const owner = await this.signer.getPubKey()
    const guardian = await this.guardian.getPubKey()

    /** guardianSignature is empty [] if co-signer is not required @see `guardianSignerNotRequired` */
    const noGuardianSignature = isEmpty(guardianSignature)

    if (this.supportsMultiSigner()) {
      const starknetOwnerSignature = this.buildStarknetSignature(
        owner,
        ownerSignature,
      )
      if (noGuardianSignature) {
        return this.prependWithSignatureLength(starknetOwnerSignature)
      }

      const starknetGuardianSignature = this.buildStarknetSignature(
        guardian,
        guardianSignature,
      )
      return this.prependWithSignatureLength(
        starknetOwnerSignature,
        starknetGuardianSignature,
      )
    }

    if (noGuardianSignature) {
      return [ownerSignature].flatMap(stark.signatureToDecimalArray)
    }

    return [ownerSignature, guardianSignature].flatMap(
      stark.signatureToDecimalArray,
    )
  }

  public static isValidSigner(
    signer: BaseSignerInterface,
  ): signer is ArgentSigner {
    return this.supportedSigners.some((supportedSigner) =>
      supportedSigner.isValid(signer),
    )
  }
}
