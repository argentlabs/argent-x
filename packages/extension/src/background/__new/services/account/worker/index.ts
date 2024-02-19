import { chromeScheduleService } from "../../../../../shared/schedule"
import { accountService } from "../../../../../shared/account/service"
import { AccountWorker } from "./implementation"
import { activityService } from "../../activity"

export const accountWorker = new AccountWorker(
  accountService,
  activityService,
  chromeScheduleService,
)
