import { activityService } from "../../../../background/__new/services/activity"
import { backgroundUIService } from "../../../../background/__new/services/ui"
import { transactionsRepo } from "../../../../background/transactions/store"
import { recoverySharedService } from "../../../../background/walletSingleton"
import { accountService } from "../../../account/service"
import { debounceService } from "../../../debounce"
import { networkService } from "../../../network/service"
import { chromeScheduleService } from "../../../schedule"
import { old_walletStore } from "../../../wallet/walletStore"
import { tokenRepo } from "../repository/token"

import { tokenService } from "../service"
import { TokenWorker } from "./implementation"

export const tokenWorker = new TokenWorker(
  old_walletStore, // TODO: remove old_walletStore. Make walletStore work properly
  transactionsRepo,
  tokenRepo,
  tokenService,
  accountService,
  networkService,
  recoverySharedService,
  backgroundUIService,
  chromeScheduleService,
  debounceService,
  activityService,
)
