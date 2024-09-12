import { recoveryStore } from "../../../shared/recovery/storage"
import { AccountMessagingService } from "./AccountMessagingService"

export const accountMessagingService = new AccountMessagingService(
  recoveryStore,
)
