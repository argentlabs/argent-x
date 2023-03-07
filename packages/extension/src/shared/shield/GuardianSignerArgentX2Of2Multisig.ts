import type {
  Abi,
  Call,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
} from "starknet"
import { Signer, typedData } from "starknet"

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

export class GuardianSignerArgentX2Of2Multisig extends Signer {
  public async signMessage(
    typedData: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const signatures = await super.signMessage(typedData, accountAddress)
    return [...signatures, ...signatures]
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
    return [...signatures, ...signatures]
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
    return [...signatures, ...signatures]
  }

  public async signDeclareTransaction({
    classHash,
    senderAddress,
    chainId,
    maxFee,
    version,
    nonce,
  }: DeclareSignerDetails) {
    const signatures = await super.signDeclareTransaction({
      classHash,
      senderAddress,
      chainId,
      maxFee,
      version,
      nonce,
    })
    return [...signatures, ...signatures]
  }
}
