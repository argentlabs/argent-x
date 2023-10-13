import { messageClient } from "../messaging/trpc"
import { MultisigService } from "./implementation"

export const multisigService = new MultisigService(messageClient)
