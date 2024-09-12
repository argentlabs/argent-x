import { messageClient } from "../trpc"
import { ClientArgentAccountService } from "./ClientArgentAccountService"

export const clientArgentAccountService = new ClientArgentAccountService(
  messageClient,
)
