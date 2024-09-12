import { SwapService } from "./SwapService"
import { messageClient } from "../trpc"

export const swapService = new SwapService(messageClient)
