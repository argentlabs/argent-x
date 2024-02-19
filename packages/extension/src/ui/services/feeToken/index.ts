import { messageClient } from "../messaging/trpc"
import { FeeTokenService } from "./implementation"

export const feeTokenService = new FeeTokenService(messageClient)
