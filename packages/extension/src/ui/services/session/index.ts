import { messageClient } from "../messaging/trpc"
import { SessionService } from "./implementation"

export const sessionService = new SessionService(messageClient)
