import { messageClient } from "../trpc"
import { ClientMultisigService } from "./ClientMultisigService"

export const multisigService = new ClientMultisigService(messageClient)
