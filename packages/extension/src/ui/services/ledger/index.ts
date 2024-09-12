import { messageClient } from "../trpc"
import { LedgerService } from "./LedgerService"

export const ledgerService = new LedgerService(messageClient)
