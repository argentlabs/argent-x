import { messageClient } from "../trpc"
import { SessionService } from "./SessionService"

export const sessionService = new SessionService(messageClient)
