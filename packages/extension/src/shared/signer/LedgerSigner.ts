import type {
  ArraySignatureType,
  Call,
  Calldata,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  TypedData,
  V2DeployAccountSignerDetails,
  V2InvocationsSignerDetails,
  V3DeployAccountSignerDetails,
  V3InvocationsSignerDetails,
} from "starknet"
import { CallData, RPC, constants, encode, hash, stark } from "starknet"
import type {
  DeployAccountFields,
  DeployAccountV1Fields,
  ResponseTxSign,
  StarknetClient,
  TxFields,
  TxV1Fields,
} from "@ledgerhq/hw-app-starknet"
import { LedgerError } from "@ledgerhq/hw-app-starknet"
import type { BaseSignerInterface } from "./BaseSignerInterface"
import { SignerType } from "../wallet.model"
import type { PublicKeyWithIndex } from "./types"
import { AxLedgerError } from "../errors/ledger"
import type { LedgerSharedService } from "../ledger/service/LedgerSharedService"
import semver from "semver"

export class LedgerSigner implements BaseSignerInterface {
  signerType: SignerType
  constructor(
    public ledgerService: LedgerSharedService,
    public derivationPath: string,
  ) {
    this.signerType = SignerType.LEDGER
  }

  async getPubKey(): Promise<string> {
    try {
      const app = await this.ledgerService.makeApp()
      const { starkKey, returnCode } = await app.getStarkKey(
        this.derivationPath,
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
    try {
      const ledger = await this.ledgerService.makeApp()
      await this.verifyAppVersion(ledger)

      const { r, s, returnCode } = await ledger.signMessage(
        this.derivationPath,
        data,
        accountAddress,
      )

      if (returnCode !== LedgerError.NoError) {
        throw new AxLedgerError({ code: returnCode })
      }

      return [r, s].map(this.makeHexFromBytes)
    } finally {
      void this.ledgerService.deinitApp()
    }
  }

  async signTransaction(
    transactions: Call[],
    details: InvocationsSignerDetails,
  ): Promise<Signature> {
    try {
      const ledger = await this.ledgerService.makeApp()
      await this.verifyAppVersion(ledger)

      let response: ResponseTxSign

      if (this.isV3InvokeSignerDetails(details)) {
        const txFields: TxFields = {
          ...details,
          accountAddress: details.walletAddress,
          paymaster_data: details.paymasterData,
          account_deployment_data: details.accountDeploymentData,
        }

        response = await ledger.signTx(
          this.derivationPath,
          transactions,
          txFields,
        )
      } else if (this.isV1SignerDetails(details)) {
        const txFields: TxV1Fields = {
          ...details,
          accountAddress: details.walletAddress,
          max_fee: details.maxFee,
        }

        response = await ledger.signTxV1(
          this.derivationPath,
          transactions,
          txFields,
        )
      } else {
        throw new Error("unsupported signTransaction version")
      }

      const { r, s, returnCode } = response

      if (returnCode !== LedgerError.NoError) {
        throw new AxLedgerError({ code: returnCode })
      }

      return [r, s].map(this.makeHexFromBytes)
    } finally {
      void this.ledgerService.deinitApp()
    }
  }

  getInvokeTransactionHash(
    details: InvocationsSignerDetails,
    compiledCalldata: Calldata,
  ): string {
    if (this.isV1SignerDetails(details)) {
      return hash.calculateInvokeTransactionHash({
        ...details,
        senderAddress: details.walletAddress,
        compiledCalldata,
        version: details.version,
      })
    } else if (this.isV3InvokeSignerDetails(details)) {
      return hash.calculateInvokeTransactionHash({
        ...details,
        senderAddress: details.walletAddress,
        compiledCalldata,
        version: details.version,
        nonceDataAvailabilityMode: stark.intDAM(
          details.nonceDataAvailabilityMode,
        ),
        feeDataAvailabilityMode: stark.intDAM(details.feeDataAvailabilityMode),
      })
    }

    throw Error("unsupported signTransaction version")
  }

  async signDeployAccountTransaction(
    details: DeployAccountSignerDetails,
  ): Promise<Signature> {
    try {
      const ledger = await this.ledgerService.makeApp()
      await this.verifyAppVersion(ledger)

      let response: ResponseTxSign

      if (Object.values(RPC.ETransactionVersion3).includes(details.version)) {
        const det = details as V3DeployAccountSignerDetails

        const txFields: DeployAccountFields = {
          ...det,
          paymaster_data: det.paymasterData,
          constructor_calldata: CallData.toCalldata(det.constructorCalldata),
          contract_address_salt: det.addressSalt.toString(),
          class_hash: det.classHash,
        }

        response = await ledger.signDeployAccount(this.derivationPath, txFields)
      } else if (
        Object.values(RPC.ETransactionVersion2).includes(details.version)
      ) {
        const det = details as V2DeployAccountSignerDetails

        const txFields: DeployAccountV1Fields = {
          ...det,
          max_fee: det.maxFee,
          contract_address_salt: det.addressSalt.toString(),
          class_hash: det.classHash,
          constructor_calldata: CallData.toCalldata(det.constructorCalldata),
        }

        response = await ledger.signDeployAccountV1(
          this.derivationPath,
          txFields,
        )
      } else {
        throw new Error("unsupported signTransaction version")
      }

      const { r, s, returnCode } = response

      if (returnCode !== LedgerError.NoError) {
        throw new AxLedgerError({ code: returnCode })
      }

      return [r, s].map(this.makeHexFromBytes)
    } finally {
      void this.ledgerService.deinitApp()
    }
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
      await this.verifyAppVersion(ledger)

      const { r, s, returnCode } = await ledger.signHash(
        this.derivationPath,
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

  private async verifyAppVersion(ledger: StarknetClient) {
    const { major, minor, patch } = await ledger.getAppVersion()
    const currentAppVersion = `${major}.${minor}.${patch}`
    const minAppVersion = process.env.MIN_LEDGER_APP_VERSION

    if (minAppVersion && semver.lt(currentAppVersion, minAppVersion)) {
      throw new AxLedgerError({ code: "UNSUPPORTED_APP_VERSION" })
    }
  }

  private isV3InvokeSignerDetails(
    details: InvocationsSignerDetails,
  ): details is V3InvocationsSignerDetails {
    return [
      constants.TRANSACTION_VERSION.F3,
      constants.TRANSACTION_VERSION.V3,
    ].includes(details.version as any)
  }

  private isV1SignerDetails(
    details: InvocationsSignerDetails,
  ): details is V2InvocationsSignerDetails {
    return [
      constants.TRANSACTION_VERSION.F1,
      constants.TRANSACTION_VERSION.V1,
    ].includes(details.version as any)
  }
}
