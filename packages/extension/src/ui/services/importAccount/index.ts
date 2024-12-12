import { messageClient } from "../trpc"
import { AccountImportClientService } from "./ClientImportAccountService"

export const clientImportAccountService = new AccountImportClientService(
  messageClient,
)
