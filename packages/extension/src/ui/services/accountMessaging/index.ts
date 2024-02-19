import { recoveryStore } from "../../../shared/recovery/storage"
import { AccountMessagingService } from "./implementation"

export const accountMessagingService = new AccountMessagingService(
  recoveryStore,
)
