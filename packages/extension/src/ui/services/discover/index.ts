import { messageClient } from "../trpc"
import { ClientDiscoverService } from "./ClientDiscoverService"

export const clientDiscoverService = new ClientDiscoverService(messageClient)
