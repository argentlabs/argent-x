import {
  Abi,
  Call,
  CallData,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  stark,
} from "starknet"
import {
  Signer,
  addAddressPadding,
  num,
  transaction,
  typedData,
  CairoVersion,
} from "starknet"

import type {
  Cosigner,
  CosignerMessage,
  CosignerOffchainMessage,
} from "./CosignerTypes"

export class GuardianSigner extends Signer {
  public cosigner: Cosigner

  constructor(
    pk: Uint8Array | string,
    cosignerImpl: Cosigner,
    private cairoVersion: CairoVersion = "0",
  ) {
    super(pk)
    this.cosigner = cosignerImpl
  }

  public async cosignMessage(
    cosignerMessage: CosignerMessage | CosignerOffchainMessage,
    isOffchainMessage = false,
  ): Promise<Signature> {
    const response = await this.cosigner(cosignerMessage, isOffchainMessage)

    const signature = [
      num.toBigInt(response.signature.r).toString(),
      num.toBigInt(response.signature.s).toString(),
    ]

    return signature
  }

  public async signMessage(
    typedData: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const signatures = await super.signMessage(typedData, accountAddress)
    const cosignerMessage: CosignerOffchainMessage = {
      message: typedData,
      accountAddress: addAddressPadding(accountAddress),
      chain: "starknet",
    }

    const cosignerSignature = await this.cosignMessage(cosignerMessage, true)

    return [signatures, cosignerSignature].flatMap(
      stark.signatureToDecimalArray,
    )
  }

  public async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): Promise<Signature> {
    const signatures = await super.signTransaction(
      transactions,
      transactionsDetail,
      abis,
    )

    const calldata = transaction.getExecuteCalldata(
      transactions,
      this.cairoVersion,
    )

    const cosignerMessage = {
      contractAddress: addAddressPadding(transactionsDetail.walletAddress),
      version: num.toBigInt(transactionsDetail.version).toString(10),
      calldata: calldata.map((data) => num.toHex(num.toBigInt(data))),
      maxFee: num.toBigInt(transactionsDetail.maxFee).toString(10),
      chainId: num.toBigInt(transactionsDetail.chainId).toString(10),
      nonce: num.toBigInt(transactionsDetail.nonce).toString(10),
    }

    const cosignerSignature = await this.cosignMessage({
      message: cosignerMessage,
      type: "starknet",
    })

    return [signatures, cosignerSignature].flatMap(
      stark.signatureToDecimalArray,
    )
  }

  public async signDeployAccountTransaction({
    classHash,
    contractAddress,
    constructorCalldata,
    addressSalt,
    maxFee,
    version,
    chainId,
    nonce,
  }: DeployAccountSignerDetails) {
    const signatures = await super.signDeployAccountTransaction({
      classHash,
      contractAddress,
      constructorCalldata,
      addressSalt,
      maxFee,
      version,
      chainId,
      nonce,
    })

    const cosignerMessage = {
      classHash,
      salt: addressSalt,
      calldata: CallData.compile(constructorCalldata).map((data) =>
        num.toHex(num.toBigInt(data)),
      ),
      maxFee: num.toBigInt(maxFee).toString(10),
      chainId: num.toBigInt(chainId).toString(10),
      version: num.toBigInt(version).toString(10),
    }

    const cosignerSignature = await this.cosignMessage({
      message: cosignerMessage,
      type: "starknetDeploy",
    })

    return [signatures, cosignerSignature].flatMap(
      stark.signatureToDecimalArray,
    )
  }

  public async signDeclareTransaction({
    classHash,
    senderAddress,
    chainId,
    maxFee,
    version,
    nonce,
  }: DeclareSignerDetails) {
    console.warn("TODO: implement GuardianSigner signDeclareTransaction")
    return super.signDeclareTransaction({
      classHash,
      senderAddress,
      chainId,
      maxFee,
      version,
      nonce,
    })
  }
}
