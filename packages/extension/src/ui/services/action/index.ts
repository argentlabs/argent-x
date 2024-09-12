import { messageClient } from "../trpc"
import { ClientActionService } from "./ClientActionService"

export const clientActionService = new ClientActionService(messageClient)
