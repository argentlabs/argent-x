import { messageClient } from "../../../ui/services/messaging/trpc"
import { walletStore } from "../../wallet/walletStore"
import { accountRepo } from "../store"
import { AccountService } from "./implementation"

export const accountService = new AccountService(
  accountRepo,
  walletStore,
  messageClient,
)
