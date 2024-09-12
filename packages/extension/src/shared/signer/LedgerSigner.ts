import {
  ArraySignatureType,
  Call,
  CallData,
  Calldata,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  RPC,
  Signature,
  TypedData,
  V2DeployAccountSignerDetails,
  V2InvocationsSignerDetails,
  V3DeployAccountSignerDetails,
  V3InvocationsSignerDetails,
  encode,
  hash,
  stark,
  transaction,
  typedData,
} from "starknet"
import { LedgerError, StarknetClient } from "@ledgerhq/hw-app-starknet"
import { BaseSignerInterface } from "./BaseSignerInterface"
import { SignerType } from "../wallet.model"
import { PublicKeyWithIndex } from "./types"
import { AxLedgerError } from "../errors/ledger"
import { LedgerSharedService } from "../ledger/service/LedgerSharedService"

export class LedgerSigner implements BaseSignerInterface {
  signerType: SignerType
  constructor(
    public ledgerService: LedgerSharedService,
    public derivatePath: string,
  ) {
    this.signerType = SignerType.LEDGER
  }

  async getPubKey(): Promise<string> {
    try {
      const app = await this.ledgerService.makeApp()
      const { starkKey, returnCode } = await app.getStarkKey(
        this.derivatePath,
        false,
      )
      if (returnCode !== LedgerError.NoError) {
        throw new AxLedgerError({ code: returnCode })
      }
      return this.makeHexFromBytes(starkKey)
    } finally {
      void this.ledgerService.deinitApp()
    }
  }

  async signMessage(
    data: TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const msgHash = typedData.getMessageHash(data, accountAddress)
    return this.signRawMsgHash(msgHash)
  }

  async signTransaction(
    transactions: Call[],
    details: InvocationsSignerDetails,
  ): Promise<Signature> {
    const compiledCalldata = transaction.getExecuteCalldata(
      transactions,
      details.cairoVersion,
    )
    const txHash = this.getInvokeTransactionHash(details, compiledCalldata)
    return this.signRawMsgHash(txHash)
  }

  getInvokeTransactionHash(
    details: InvocationsSignerDetails,
    compiledCalldata: Calldata,
  ): string {
    if (
      Object.values(RPC.ETransactionVersion2).includes(details.version as any)
    ) {
      const det = details as V2InvocationsSignerDetails
      return hash.calculateInvokeTransactionHash({
        ...det,
        senderAddress: det.walletAddress,
        compiledCalldata,
        version: det.version,
      })
    } else if (
      Object.values(RPC.ETransactionVersion3).includes(details.version as any)
    ) {
      const det = details as V3InvocationsSignerDetails
      return hash.calculateInvokeTransactionHash({
        ...det,
        senderAddress: det.walletAddress,
        compiledCalldata,
        version: det.version,
        nonceDataAvailabilityMode: stark.intDAM(det.nonceDataAvailabilityMode),
        feeDataAvailabilityMode: stark.intDAM(det.feeDataAvailabilityMode),
      })
    }

    throw Error("unsupported signTransaction version")
  }

  async signDeployAccountTransaction(
    details: DeployAccountSignerDetails,
  ): Promise<Signature> {
    const compiledConstructorCalldata = CallData.compile(
      details.constructorCalldata,
    )
    const txHash = this.getDeployAccountTransactionHash(
      details,
      compiledConstructorCalldata,
    )

    return this.signRawMsgHash(txHash)
  }

  getDeployAccountTransactionHash(
    details: DeployAccountSignerDetails,
    compiledCalldata: Calldata,
  ): string {
    if (
      Object.values(RPC.ETransactionVersion2).includes(details.version as any)
    ) {
      const det = details as V2DeployAccountSignerDetails
      return hash.calculateDeployAccountTransactionHash({
        ...det,
        salt: det.addressSalt,
        constructorCalldata: compiledCalldata,
        version: det.version,
      })
    } else if (
      Object.values(RPC.ETransactionVersion3).includes(details.version as any)
    ) {
      const det = details as V3DeployAccountSignerDetails
      return hash.calculateDeployAccountTransactionHash({
        ...det,
        salt: det.addressSalt,
        compiledConstructorCalldata: compiledCalldata,
        version: det.version,
        nonceDataAvailabilityMode: stark.intDAM(det.nonceDataAvailabilityMode),
        feeDataAvailabilityMode: stark.intDAM(det.feeDataAvailabilityMode),
      })
    }
    throw Error("unsupported signDeployAccountTransaction version")
  }

  signDeclareTransaction(_: DeclareSignerDetails): Promise<Signature> {
    throw new Error("Method not implemented.")
  }

  async signRawMsgHash(msgHash: string): Promise<ArraySignatureType> {
    try {
      const ledger = await this.ledgerService.makeApp()
      const { r, s, returnCode } = await ledger.signHash(
        this.derivatePath,
        msgHash,
      )

      if (returnCode !== LedgerError.NoError) {
        throw new AxLedgerError({ code: returnCode })
      }

      return [r, s].map(this.makeHexFromBytes)
    } finally {
      void this.ledgerService.deinitApp()
    }
  }

  makeHexFromBytes(bytes: Uint8Array): string {
    return encode.addHexPrefix(encode.buf2hex(bytes))
  }

  getPrivateKey(): string {
    throw new Error("Ledger does not support private key access")
  }

  public static isValid(signer: BaseSignerInterface): signer is LedgerSigner {
    return signer.signerType === SignerType.LEDGER
  }

  public static async generatePublicKeys(
    ledger: StarknetClient,
    start: number,
    numberOfPairs: number,
    baseDerivationPath: string,
  ): Promise<PublicKeyWithIndex[]> {
    const pubKeys: PublicKeyWithIndex[] = []
    for (let index = start; index < start + numberOfPairs; index++) {
      const derivationPath = `${baseDerivationPath}/${index}`

      const { starkKey, returnCode } = await ledger.getStarkKey(
        derivationPath,
        false,
      )

      if (returnCode !== LedgerError.NoError) {
        throw new AxLedgerError({ code: returnCode })
      }

      pubKeys.push({
        pubKey: encode.addHexPrefix(encode.buf2hex(starkKey)),
        index,
      })
    }

    return pubKeys
  }
}
