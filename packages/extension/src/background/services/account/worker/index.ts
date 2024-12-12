import { chromeScheduleService } from "../../../../shared/schedule"
import { accountService } from "../../../../shared/account/service"
import { AccountWorker } from "./AccountWorker"
import { activityService } from "../../activity"
import { walletStore } from "../../../../shared/wallet/walletStore"
import { ampli } from "../../../../shared/analytics"

export const accountWorker = new AccountWorker(
  walletStore,
  accountService,
  activityService,
  chromeScheduleService,
  ampli,
)
