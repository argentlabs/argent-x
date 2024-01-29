import { activityService } from "../../activity"
import { backgroundUIService } from "../../ui"
import { transactionsRepo } from "../../../../../shared/transactions/store"
import { recoverySharedService } from "../../../../walletSingleton"
import { debounceService } from "../../../../../shared/debounce"
import { networkService } from "../../../../../shared/network/service"
import { chromeScheduleService } from "../../../../../shared/schedule"
import { old_walletStore } from "../../../../../shared/wallet/walletStore"
import { tokenRepo } from "../../../../../shared/token/__new/repository/token"

import { tokenService } from "../../../../../shared/token/__new/service"
import { TokenWorker } from "./implementation"

export const tokenWorker = new TokenWorker(
  old_walletStore, // TODO: remove old_walletStore. Make walletStore work properly
  transactionsRepo,
  tokenRepo,
  tokenService,
  networkService,
  recoverySharedService,
  backgroundUIService,
  chromeScheduleService,
  debounceService,
  activityService,
)
