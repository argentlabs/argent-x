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
import { isV3Details, mapResourceBoundsToBackendBounds } from "./utils"

// TODO: remove when webwallet and starknetkit are updated to snjs v6
export type TransactionVersion =
  | "0x0"
  | "0x1"
  | "0x2"
  | "0x3"
  | "0x100000000000000000000000000000000"
  | "0x100000000000000000000000000000001"
  | "0x100000000000000000000000000000002"
  | "0x100000000000000000000000000000003"

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

    return [
      num.toBigInt(response.signature.r).toString(),
      num.toBigInt(response.signature.s).toString(),
    ]
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

  public async ownerSignTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    _?: Abi[],
  ): Promise<Signature> {
    const signatures = await super.signTransaction(
      transactions,
      transactionsDetail,
    )

    return [signatures].flatMap(stark.signatureToDecimalArray)
  }

  public async cosignTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    _?: Abi[],
  ): Promise<Signature> {
    const calldata = transaction.getExecuteCalldata(
      transactions,
      this.cairoVersion,
    )

    const cosignerSignature = await this.cosignMessage(
      isV3Details(transactionsDetail)
        ? {
            type: "starknetV3",
            message: {
              sender_address: addAddressPadding(
                transactionsDetail.walletAddress,
              ),
              version: num.toBigInt(transactionsDetail.version).toString(10),
              calldata: calldata.map((data) => num.toHex(num.toBigInt(data))),
              chain_id: num.toBigInt(transactionsDetail.chainId).toString(10),
              nonce: num.toBigInt(transactionsDetail.nonce).toString(10),
              fee_data_availability_mode: "L1",
              nonce_data_availability_mode: "L1",
              paymaster_data: [],
              account_deployment_data: [],
              tip: 0,
              resource_bounds: {
                l1_gas: mapResourceBoundsToBackendBounds(
                  transactionsDetail.resourceBounds.l1_gas,
                ),
                l2_gas: mapResourceBoundsToBackendBounds(
                  transactionsDetail.resourceBounds.l2_gas,
                ),
              },
            },
          }
        : {
            type: "starknet",
            message: {
              contractAddress: addAddressPadding(
                transactionsDetail.walletAddress,
              ),
              version: num.toBigInt(transactionsDetail.version).toString(10),
              calldata: calldata.map((data) => num.toHex(num.toBigInt(data))),
              chainId: num.toBigInt(transactionsDetail.chainId).toString(10),
              nonce: num.toBigInt(transactionsDetail.nonce).toString(10),
              maxFee: num.toBigInt(transactionsDetail.maxFee).toString(10),
            },
          },
    )

    return [cosignerSignature].flatMap(stark.signatureToDecimalArray)
  }

  public async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    _?: Abi[],
  ): Promise<Signature> {
    // TODO: remove when webwallet and starknetkit are updated to snjs v6
    const transactionsDetailCopy = { ...transactionsDetail }
    if (!num.isHex(transactionsDetailCopy.version)) {
      transactionsDetailCopy.version = num.toHex(
        transactionsDetailCopy.version,
      ) as TransactionVersion
    }

    const signatures = await super.signTransaction(
      transactions,
      transactionsDetailCopy,
    )

    const cosignerSignature = await this.cosignTransaction(
      transactions,
      transactionsDetailCopy,
      _,
    )

    return [signatures, cosignerSignature].flatMap(
      stark.signatureToDecimalArray,
    )
  }

  public async signDeployAccountTransaction(
    deployDetails: DeployAccountSignerDetails,
  ) {
    // TODO: remove when webwallet and starknetkit are updated to snjs v6
    const deployDetailsCopy = { ...deployDetails }
    if (!num.isHex(deployDetailsCopy.version)) {
      deployDetailsCopy.version = num.toHex(
        deployDetailsCopy.version,
      ) as TransactionVersion
    }

    const signatures = await super.signDeployAccountTransaction(
      deployDetailsCopy,
    )

    const cosignerSignature = await this.cosignMessage(
      isV3Details(deployDetailsCopy)
        ? {
            type: "starknetDeployV3",
            message: {
              class_hash: deployDetailsCopy.classHash,
              contract_address_salt: deployDetailsCopy.addressSalt,
              constructor_calldata: CallData.compile(
                deployDetailsCopy.constructorCalldata,
              ).map((data) => num.toHex(num.toBigInt(data))),
              chain_id: num.toBigInt(deployDetailsCopy.chainId).toString(10),
              version: num.toBigInt(deployDetailsCopy.version).toString(10),
              fee_data_availability_mode: "L1",
              nonce_data_availability_mode: "L1",
              paymaster_data: [],
              tip: 0,
              resource_bounds: {
                l1_gas: mapResourceBoundsToBackendBounds(
                  deployDetailsCopy.resourceBounds.l1_gas,
                ),
                l2_gas: mapResourceBoundsToBackendBounds(
                  deployDetailsCopy.resourceBounds.l2_gas,
                ),
              },
            },
          }
        : {
            type: "starknetDeploy",
            message: {
              classHash: deployDetailsCopy.classHash,
              salt: deployDetailsCopy.addressSalt,
              calldata: CallData.compile(
                deployDetailsCopy.constructorCalldata,
              ).map((data) => num.toHex(num.toBigInt(data))),
              chainId: num.toBigInt(deployDetailsCopy.chainId).toString(10),
              version: num.toBigInt(deployDetailsCopy.version).toString(10),
              maxFee: num.toBigInt(deployDetailsCopy.maxFee).toString(10),
            },
          },
    )

    return [signatures, cosignerSignature].flatMap(
      stark.signatureToDecimalArray,
    )
  }

  public async signDeclareTransaction(declareDetails: DeclareSignerDetails) {
    console.warn("TODO: implement GuardianSigner signDeclareTransaction")
    return super.signDeclareTransaction(declareDetails)
  }
}
