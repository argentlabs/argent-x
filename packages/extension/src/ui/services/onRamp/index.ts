import { messageClient } from "../trpc"
import { ClientOnRampService } from "./OnRampService"

export const clientOnRampService = new ClientOnRampService(messageClient)
