import {
  Abi,
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  Signer,
  SignerInterface,
} from "starknet"

export class MultisigSigner extends Signer implements SignerInterface {
  public async signDeployAccountTransaction(
    deployAccountSignerDetails: DeployAccountSignerDetails,
  ): Promise<Signature> {
    const signatures = await super.signDeployAccountTransaction(
      deployAccountSignerDetails,
    )

    const publicSigner = await this.getPubKey()

    return [publicSigner, ...signatures]
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

    return [publicSigner, ...signatures]
  }
}
