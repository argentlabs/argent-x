import { messageClient } from "../messaging/trpc"
import { TokenService } from "./implementation"

export const tokenService = new TokenService(messageClient)
