import { messageClient } from "../messaging/trpc"
import { DiscoverService } from "./client"

export const clientDiscoverService = new DiscoverService(messageClient)
