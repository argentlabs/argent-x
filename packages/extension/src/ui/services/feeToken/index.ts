import { messageClient } from "../trpc"
import { FeeTokenService } from "./FeeTokenService"

export const feeTokenService = new FeeTokenService(messageClient)
