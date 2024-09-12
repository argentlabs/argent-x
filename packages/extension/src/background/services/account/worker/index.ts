import { chromeScheduleService } from "../../../../shared/schedule"
import { accountService } from "../../../../shared/account/service"
import { AccountWorker } from "./AccountWorker"
import { activityService } from "../../activity"

export const accountWorker = new AccountWorker(
  accountService,
  activityService,
  chromeScheduleService,
)
