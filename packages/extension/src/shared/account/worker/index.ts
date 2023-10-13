import { chromeScheduleService } from "../../schedule"
import { accountService } from "../service"
import { AccountWorker } from "./implementation"

export const accountWorker = new AccountWorker(
  accountService,
  chromeScheduleService,
)
