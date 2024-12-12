import type { IMultisigService } from "../../../shared/multisig/service/messaging/IMultisigService"
import type { SignerMetadata } from "../../../shared/multisig/types"

export interface IClientMultisigService extends IMultisigService {
  updateSignerMetadata(
    creator: string,
    signerMetadata: SignerMetadata,
  ): Promise<void>
  updateSignersMetadata(
    multisigPublicKey: string,
    signersMetadata: SignerMetadata[],
  ): Promise<void>
  removeSignerMetadata(
    multisigPublicKey: string,
    signerKey: string,
  ): Promise<void>
}
