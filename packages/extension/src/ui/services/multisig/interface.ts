import { IMultisigService } from "../../../shared/multisig/service/messaging/interface"
import { SignerMetadata } from "../../../shared/multisig/types"

export interface IClientMultisigService extends IMultisigService {
  updateSignerMetadata(
    creator: string,
    signerMetadata: SignerMetadata,
  ): Promise<void>
}
