import { ArraySignatureType } from "starknet"
import { IMultisigService } from "../../../shared/multisig/service/messaging/IMultisigService"

export interface IBackgroundMultisigService extends IMultisigService {
  waitForOffchainSignatures(requestId: string): Promise<ArraySignatureType>
}
