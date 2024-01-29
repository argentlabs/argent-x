import { SwapService } from "./implementation"
import { messageClient } from "../messaging/trpc"

export const swapService = new SwapService(messageClient)
