import { chromeScheduleService } from "../../../../../shared/schedule"
import { accountService } from "../../../../../shared/account/service"
import { AccountWorker } from "./implementation"
import { backgroundUIService } from "../../ui"
import { debounceService } from "../../../../../shared/debounce"
import { activityService } from "../../activity"

export const accountWorker = new AccountWorker(
  accountService,
  activityService,
  chromeScheduleService,
  backgroundUIService,
  debounceService,
)
