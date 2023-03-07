import type {
  Abi,
  Call,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  KeyPair,
  Signature,
} from "starknet"
import {
  Signer,
  addAddressPadding,
  number,
  transaction,
  typedData,
} from "starknet"

import type {
  Cosigner,
  CosignerMessage,
  CosignerOffchainMessage,
} from "./CosignerTypes"

export class GuardianSigner extends Signer {
  public cosigner: Cosigner

  constructor(keyPair: KeyPair, cosignerImpl: Cosigner) {
    super(keyPair)
    this.cosigner = cosignerImpl
  }

  public async cosignMessage(
    cosignerMessage: CosignerMessage | CosignerOffchainMessage,
    isOffchainMessage = false,
  ): Promise<Signature> {
    const response = await this.cosigner(cosignerMessage, isOffchainMessage)

    const signature = [
      number.toBN(response.signature.r).toString(),
      number.toBN(response.signature.s).toString(),
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

    return [...signatures, ...cosignerSignature]
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
      version: number.toBN(transactionsDetail.version).toString(10),
      calldata: calldata.map((data) => number.toHex(number.toBN(data))),
      maxFee: number.toBN(transactionsDetail.maxFee).toString(10),
      chainId: number.toBN(transactionsDetail.chainId).toString(10),
      nonce: number.toBN(transactionsDetail.nonce).toString(10),
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
        number.toHex(number.toBN(data)),
      ),
      maxFee: number.toBN(maxFee).toString(10),
      chainId: number.toBN(chainId).toString(10),
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
