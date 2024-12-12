import type {
  Abi,
  Call,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  TypedData,
} from "starknet"
import { CallData, hash, stark } from "starknet"
import type { CairoVersion, V3InvocationsSignerDetails } from "starknet"
import { addAddressPadding, num, transaction } from "starknet"
import type {
  Cosigner,
  CosignerMessage,
  CosignerOffchainMessage,
} from "@argent/x-guardian"
import type { BaseSignerInterface } from "./BaseSignerInterface"
import { isEqualAddress } from "@argent/x-shared"

export function isV3Details<T extends { version: string }>(
  details: T,
): details is T & Pick<V3InvocationsSignerDetails, "version"> {
  return (
    details.version === "0x3" ||
    details.version === "0x100000000000000000000000000000003"
  )
}

type RESOURCE_BOUNDS = {
  max_amount: string
  max_price_per_unit: string
}
export function mapResourceBoundsToBackendBounds(bounds: RESOURCE_BOUNDS): {
  max_amount: number
  max_price_per_unit: number
} {
  return {
    max_amount: Number(num.toBigInt(bounds.max_amount).toString(10)),
    max_price_per_unit: Number(
      num.toBigInt(bounds.max_price_per_unit).toString(10),
    ),
  }
}

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

/**
 * 'Escape' entrypoints that can be used when guardian is assigned, but without cosigner
 */
export const guardianSignerNotRequired = [
  "escapeGuardian",
  "triggerEscapeGuardian",
  "escape_guardian",
  "trigger_escape_guardian",
]

export const guardianSignerNotRequiredSelectors = guardianSignerNotRequired.map(
  (entrypoint) => hash.getSelectorFromName(entrypoint),
)

export class GuardianSignerV2 implements BaseSignerInterface {
  public cosigner: Cosigner
  signerType = "cosigner"

  constructor(
    cosignerImpl: Cosigner,
    public pubKey?: string, // Only required to implement getPubKey
    protected cairoVersion: CairoVersion = "1",
  ) {
    this.cosigner = cosignerImpl
  }

  getPubKey(): Promise<string> {
    if (!this.pubKey) {
      throw new Error("GuardianSignerV2: public key not set")
    }

    return Promise.resolve(this.pubKey)
  }

  getPrivateKey(): string {
    throw new Error("GuardianSigner does not support private key access")
  }

  public async cosignMessage(
    cosignerMessage: CosignerMessage | CosignerOffchainMessage,
    isOffchainMessage = false,
  ): Promise<Signature> {
    /** special case - check guardianSignerNotRequired */
    if (
      "type" in cosignerMessage &&
      (cosignerMessage.type === "starknet" ||
        cosignerMessage.type === "starknetV3") &&
      guardianSignerNotRequiredSelectors.find((notRequiredSelector) =>
        isEqualAddress(
          notRequiredSelector,
          cosignerMessage.message.calldata[2], // calldata[2] is the selector
        ),
      )
    ) {
      return []
    }

    const response = await this.cosigner(cosignerMessage, isOffchainMessage)

    return [
      num.toBigInt(response.signature.r).toString(),
      num.toBigInt(response.signature.s).toString(),
    ]
  }

  public async signMessage(
    typedData: TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const cosignerMessage: CosignerOffchainMessage = {
      message: typedData,
      accountAddress: addAddressPadding(accountAddress),
      chain: "starknet",
    }
    const cosignerSignature = await this.cosignMessage(cosignerMessage, true)

    return stark.signatureToDecimalArray(cosignerSignature)
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
  ): Promise<Signature> {
    // TODO: remove when webwallet and starknetkit are updated to snjs v6
    const transactionsDetailCopy = { ...transactionsDetail }
    if (!num.isHex(transactionsDetailCopy.version)) {
      transactionsDetailCopy.version = num.toHex(
        transactionsDetailCopy.version,
      ) as TransactionVersion
    }

    const cosignerSignature = await this.cosignTransaction(
      transactions,
      transactionsDetailCopy,
    )

    return stark.signatureToDecimalArray(cosignerSignature)
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
              nonce: num.toBigInt(deployDetailsCopy.nonce).toString(10),
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

    return stark.signatureToDecimalArray(cosignerSignature)
  }

  public async signDeclareTransaction(
    _: DeclareSignerDetails,
  ): Promise<Signature> {
    throw new Error("TODO: implement GuardianSigner signDeclareTransaction")
  }

  public async signRawMsgHash(_: string): Promise<Signature> {
    throw new Error("TODO: implement GuardianSigner signRawMsgHash")
  }

  public static isValid(_: BaseSignerInterface): boolean {
    return true
  }
}
