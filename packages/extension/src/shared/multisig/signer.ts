import {
  Abi,
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  KeyPair,
  Signature,
  Signer,
  number,
} from "starknet"

export class MultisigSigner extends Signer {
  constructor(keyPair: KeyPair) {
    super(keyPair)
  }

  public async signDeployAccountTransaction(
    deployAccountSignerDetails: DeployAccountSignerDetails,
  ): Promise<Signature> {
    const signatures = await super.signDeployAccountTransaction(
      deployAccountSignerDetails,
    )

    const publicSigner = await this.getPubKey()

    return [number.toFelt(publicSigner), ...signatures]
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

    const publicSigner = await this.getPubKey()

    return [number.toFelt(publicSigner), ...signatures]
  }
}
