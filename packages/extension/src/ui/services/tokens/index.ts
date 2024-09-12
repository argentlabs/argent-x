import { messageClient } from "../trpc"
import { ClientTokenService } from "./ClientTokenService"

export const clientTokenService = new ClientTokenService(messageClient)
