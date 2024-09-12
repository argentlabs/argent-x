import { messageClient } from "../../trpc"
import { ClientActivityCacheService } from "./ClientActivityCacheService"

export const clientActivityCacheService = new ClientActivityCacheService(
  messageClient,
)
