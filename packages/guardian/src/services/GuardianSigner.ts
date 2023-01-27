import {
  Abi,
  Call,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  Signer,
  SignerInterface,
  addAddressPadding,
  ec,
  number,
  transaction,
  typedData,
} from "starknet"

import type { Cosigner, CosignerMessage } from "./CosignerTypes"

export class GuardianSigner extends Signer implements SignerInterface {
  public cosigner: Cosigner

  constructor(pk: string | Uint8Array, cosignerImpl: Cosigner) {
    super(pk)
    this.cosigner = cosignerImpl
  }

  public async cosignMessage(
    cosignerMessage: CosignerMessage,
  ): Promise<Signature> {
    const response = await this.cosigner(cosignerMessage)

    const signature = [
      number.toBigInt(response.signature.r),
      number.toBigInt(response.signature.s),
    ]

    return new ec.starkCurve.Signature(...signature)
  }

  public async signMessage(
    typedData: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    console.warn("TODO: implement GuardianSigner signMessage")
    return super.signMessage(typedData, accountAddress)
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

    const calldata = transaction.fromCallsToExecuteCalldata(transactions)

    const cosignerMessage = {
      contractAddress: addAddressPadding(transactionsDetail.walletAddress),
      version: transactionsDetail.version.toString(10),
      calldata: calldata.map((data) => number.toHex(number.toBigInt(data))),
      maxFee: number.toBigInt(transactionsDetail.maxFee).toString(10),
      chainId: number.toBigInt(transactionsDetail.chainId).toString(10),
      nonce: transactionsDetail.nonce.toString(10),
    }

    const cosignerSignature = await this.cosignMessage({
      message: cosignerMessage,
      type: "starknet",
    })

    return [...signatures, ...cosignerSignature]
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
      calldata: constructorCalldata.map((data) =>
        number.toHex(number.toBigInt(data)),
      ),
      maxFee: number.toBigInt(maxFee).toString(10),
      chainId: number.toBigInt(chainId).toString(10),
      version,
    }

    const cosignerSignature = await this.cosignMessage({
      message: cosignerMessage,
      type: "starknetDeploy",
    })

    return [...signatures, ...cosignerSignature]
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
