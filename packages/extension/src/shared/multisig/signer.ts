import type {
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  TypedData,
} from "starknet"
import { Signer, stark, hash } from "starknet"
import type { ApiMultisigOffchainSignatureState } from "./multisig.model"

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
    const publicSigner = await this.getPubKey()
    return [publicSigner, ...stark.signatureToDecimalArray(signatures)] // Intentionally publicSigner is hex and signatures are decimal. Backend should be able to handle this
  }

  public async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
  ): Promise<Signature> {
    const signatures = await super.signTransaction(
      transactions,
      transactionsDetail,
    )
    const publicSigner = await this.getPubKey()
    return [publicSigner, ...stark.signatureToDecimalArray(signatures)]
  }

  public async signMessage(
    typedData: TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const signature = await super.signMessage(typedData, accountAddress)
    const publicSigner = await this.getPubKey()
    return [publicSigner, ...stark.signatureToDecimalArray(signature)]
  }

  public async signStateMessage(
    msgHash: string,
    state: ApiMultisigOffchainSignatureState,
  ): Promise<Signature> {
    // Pedersen hash of the state and the message hash
    // pedersen(starknet_keccak(state), msg_hash)
    const stateMsghash = hash.computePedersenHash(
      hash.starknetKeccak(state),
      msgHash,
    )
    const signature = await this.signRaw(stateMsghash)
    const publicSigner = await this.getPubKey()
    return [publicSigner, ...stark.signatureToDecimalArray(signature)]
  }
}
