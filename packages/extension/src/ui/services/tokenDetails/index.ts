import { messageClient } from "../trpc"
import { ClientTokenDetailsService } from "./ClientTokenDetailsService"

export const clientTokenDetailsService = new ClientTokenDetailsService(
  messageClient,
)
