import type { ArraySignatureType } from "starknet"
import type { IMultisigService } from "../../../shared/multisig/service/messaging/IMultisigService"

export interface IBackgroundMultisigService extends IMultisigService {
  waitForOffchainSignatures(requestId: string): Promise<ArraySignatureType>
}
