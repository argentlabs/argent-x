import {
  Abi,
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  Signer,
  stark,
} from "starknet"

export class MultisigSigner extends Signer {
  constructor(pk: Uint8Array | string) {
    super(pk)
  }

  public async signDeployAccountTransaction(
    deployAccountSignerDetails: DeployAccountSignerDetails,
  ): Promise<Signature> {
    const signatures = await super.signDeployAccountTransaction(
      deployAccountSignerDetails,
    )

    const formattedSignatures = stark.signatureToDecimalArray(signatures)

    const publicSigner = await this.getPubKey()

    return [publicSigner, ...formattedSignatures] // Intentionally publicSigner is hex and signatures are decimal. Backend should be able to handle this
  }

  public async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[] | undefined,
  ): Promise<Signature> {
    const signatures = await super.signTransaction(
      transactions,
      transactionsDetail,
      abis,
    )

    const formattedSignatures = stark.signatureToDecimalArray(signatures)

    const publicSigner = await this.getPubKey()

    return [publicSigner, ...formattedSignatures]
  }
}
