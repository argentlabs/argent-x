import {
  Call,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  stark,
} from "starknet"
import { TypedData } from "starknet"
import { ArgentSigner } from "../signer/ArgentSigner"

/**
 * Use case: `escapeGuardian` cannot be used to remove or set guardian to ZERO
 * so instead guardian is set to the account public key
 *
 * Once the account guardian is the same as the account public key,
 * the account effectively becomes a 2 of 2 multisig
 * where both required signatures are the same
 *
 * This Signer overrides each signing method to return
 * such signatures
 */

export class GuardianSelfSigner extends ArgentSigner {
  constructor(secret: string, derivationPath: string) {
    super(secret, derivationPath)
  }

  public async signMessage(
    typedData: TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const signatures = await super.signMessage(typedData, accountAddress)
    const formattedSignatures = stark.signatureToDecimalArray(signatures)
    return [...formattedSignatures, ...formattedSignatures]
  }

  public async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
  ): Promise<Signature> {
    const signatures = await super.signTransaction(
      transactions,
      transactionsDetail,
    )
    const formattedSignatures = stark.signatureToDecimalArray(signatures)
    return [...formattedSignatures, ...formattedSignatures]
  }

  public async signDeployAccountTransaction(
    details: DeployAccountSignerDetails,
  ) {
    const signatures = await super.signDeployAccountTransaction(details)
    const formattedSignatures = stark.signatureToDecimalArray(signatures)
    return [...formattedSignatures, ...formattedSignatures]
  }

  public async signDeclareTransaction(details: DeclareSignerDetails) {
    const signatures = await super.signDeclareTransaction(details)
    const formattedSignatures = stark.signatureToDecimalArray(signatures)
    return [...formattedSignatures, ...formattedSignatures]
  }
}
