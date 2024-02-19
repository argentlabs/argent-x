import { messageClient } from "../messaging/trpc"
import { ProvisionService } from "./implementation"

export const provisionService = new ProvisionService(messageClient)
