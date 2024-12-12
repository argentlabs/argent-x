import type {
  ArraySignatureType,
  CairoVersion,
  Call,
  DeclareContractPayload,
  DeployAccountContractPayload,
  ProviderInterface,
  Signature,
  UniversalDetails,
} from "starknet"
import {
  Account,
  CairoCustomEnum,
  CallData,
  TransactionType,
  constants,
  extractContractHashes,
  hash,
  num,
  stark,
  transaction,
} from "starknet"
import type {
  DeclareSignerBuilderPayload,
  DeployAccountSignerBuilderPayload,
  InvocationsSignerBuilderPayload,
} from "./types"
import type { Address } from "@starknet-io/types-js"
import { EDAMode } from "@starknet-io/types-js"
import type { BaseSignerInterface } from "../signer/BaseSignerInterface"
import {
  isEqualAddress,
  getArgentAccountWithMultiSignerClassHashes,
  ensureArray,
  txVersionSchema,
} from "@argent/x-shared"

const { v3Details } = stark

export class BaseStarknetAccount extends Account {
  constructor(
    provider: ProviderInterface,
    address: Address,
    public signer: BaseSignerInterface,
    cairoVersion: CairoVersion,
    public readonly classHash: string | undefined,
  ) {
    super(provider, address, signer, cairoVersion)
  }

  async buildInvocationSignerDetailsPayload(
    details: UniversalDetails,
  ): Promise<InvocationsSignerBuilderPayload> {
    const nonce = num.toBigInt(details.nonce ?? (await this.getNonce()))
    const chainId = await this.getChainId()

    return {
      ...v3Details(details),
      walletAddress: this.address,
      nonce,
      chainId,
      cairoVersion: await this.getCairoVersion(),
    }
  }

  async buildDeclareSignerDetailsPayload(
    payload: DeclareContractPayload,
    details: UniversalDetails = {},
  ): Promise<DeclareSignerBuilderPayload> {
    const { classHash, compiledClassHash } = extractContractHashes(payload)
    if (
      typeof compiledClassHash === "undefined" &&
      (details.version === constants.TRANSACTION_VERSION.F3 ||
        details.version === constants.TRANSACTION_VERSION.V3)
    ) {
      throw Error(
        "V3 Transaction work with Cairo1 Contracts and require compiledClassHash",
      )
    }

    const nonce = num.toBigInt(details.nonce ?? (await this.getNonce()))
    const chainId = await this.getChainId()

    return {
      ...v3Details(details),
      classHash,
      senderAddress: this.address,
      compiledClassHash: compiledClassHash as string, // TODO: TS, cast because optional for v2 and required for v3, thrown if not present
      nonce,
      chainId,
    }
  }

  public async buildAccountDeploySignerDetailsPayload(
    {
      classHash,
      constructorCalldata = [],
      addressSalt = 0,
      contractAddress: providedContractAddress,
    }: DeployAccountContractPayload,
    details: UniversalDetails = {},
  ): Promise<DeployAccountSignerBuilderPayload> {
    const nonce = 0n // DEPLOY_ACCOUNT transaction will have a nonce zero as it is the first transaction in the account
    const chainId = await this.getChainId()

    const compiledCalldata = CallData.compile(constructorCalldata)
    const contractAddress =
      providedContractAddress ??
      hash.calculateContractAddressFromHash(
        addressSalt,
        classHash,
        compiledCalldata,
        0,
      )

    return {
      ...v3Details(details),
      classHash,
      addressSalt,
      constructorCalldata: compiledCalldata,
      contractAddress,
      nonce,
      chainId,
    }
  }

  public async buildAccountDeployTransactionPayload(
    contractPayload: DeployAccountContractPayload,
    details: UniversalDetails,
  ) {
    const version = this.getTxVersion(details)

    const payload = await this.buildAccountDeploySignerDetailsPayload(
      contractPayload,
      details,
    )

    const nonceDataAvailabilityMode = payload.nonceDataAvailabilityMode
      ? stark.intDAM(payload.nonceDataAvailabilityMode)
      : EDAMode.L1

    const feeDataAvailabilityMode = payload.feeDataAvailabilityMode
      ? stark.intDAM(payload.feeDataAvailabilityMode)
      : EDAMode.L1

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.DEPLOY_ACCOUNT, payload },
      details,
    )

    return {
      ...payload,
      ...estimate,
      nonceDataAvailabilityMode,
      feeDataAvailabilityMode,
      salt: payload.addressSalt,
      compiledConstructorCalldata: CallData.compile(
        payload.constructorCalldata,
      ),
      version: version as any, // TS, cast because version is issue in snjs
    }
  }

  public async getAccountDeployTransactionHash(
    payload: DeployAccountContractPayload,
    details: UniversalDetails = {},
  ) {
    const transactionPayload = await this.buildAccountDeployTransactionPayload(
      payload,
      details,
    )
    return hash.calculateDeployAccountTransactionHash(transactionPayload)
  }

  public async buildInvokeTransactionPayload(
    calls: Call | Call[],
    details: UniversalDetails = {},
  ) {
    const version = this.getTxVersion(details)

    const { cairoVersion, walletAddress, ...payload } =
      await this.buildInvocationSignerDetailsPayload(details)

    const nonceDataAvailabilityMode = payload.nonceDataAvailabilityMode
      ? stark.intDAM(payload.nonceDataAvailabilityMode)
      : EDAMode.L1

    const feeDataAvailabilityMode = payload.feeDataAvailabilityMode
      ? stark.intDAM(payload.feeDataAvailabilityMode)
      : EDAMode.L1

    const compiledCalldata = transaction.getExecuteCalldata(
      ensureArray(calls),
      cairoVersion,
    )

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.INVOKE, payload: calls },
      details,
    )

    return {
      ...payload,
      ...estimate,
      compiledCalldata,
      nonceDataAvailabilityMode,
      feeDataAvailabilityMode,
      senderAddress: walletAddress,
      version: version as any, // TS, cast because version is issue in snjs
    }
  }

  public async getInvokeTransactionHash(
    calls: Call | Call[],
    details: UniversalDetails = {},
  ) {
    const payload = await this.buildInvokeTransactionPayload(calls, details)

    return hash.calculateInvokeTransactionHash(payload)
  }

  protected supportsMultiSigner() {
    return getArgentAccountWithMultiSignerClassHashes().some((ch) =>
      isEqualAddress(ch, this.classHash),
    )
  }

  protected buildStarknetSignature(signer: string, signature: Signature) {
    const formattedSig = stark.formatSignature(signature)
    return new CairoCustomEnum({
      Starknet: { signer, r: formattedSig[0], s: formattedSig[1] },
      Secp256k1: undefined,
      Secp256r1: undefined,
      Eip191: undefined,
      Webauthn: undefined,
    })
  }

  protected prependWithSignatureLength(
    ...args: CairoCustomEnum[]
  ): ArraySignatureType {
    const signatureLength = args.length.toString()
    const compiledSigs = CallData.compile(args)
    return [signatureLength, ...compiledSigs]
  }

  protected getTxVersion({
    version,
  }: Pick<UniversalDetails, "version">): constants.TRANSACTION_VERSION {
    return txVersionSchema.parse(version) as constants.TRANSACTION_VERSION
  }
}
