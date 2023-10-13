import { messageClient } from "../messaging/trpc"
import { ArgentAccountService } from "./implementation"

export const argentAccountService = new ArgentAccountService(messageClient)
