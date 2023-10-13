import { messageClient } from "../messaging/trpc"
import { ClientActionService } from "./client"

export const clientActionService = new ClientActionService(messageClient)
