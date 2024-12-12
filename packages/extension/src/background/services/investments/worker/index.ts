import { activityService } from "../../activity"
import { backgroundUIService } from "../../ui"
import { recoverySharedService } from "../../../walletSingleton"
import { debounceService } from "../../../../shared/debounce"
import { chromeScheduleService } from "../../../../shared/schedule"
import { old_walletStore } from "../../../../shared/wallet/walletStore"

import { accountService } from "../../../../shared/account/service"
import { InvestmentWorker } from "./InvestmentWorker"
import { investmentService } from ".."
import { tokenService } from "../../../../shared/token/__new/service"

export const investmentWorker = new InvestmentWorker(
  old_walletStore, // TODO: remove old_walletStore. Make walletStore work properly
  investmentService,
  accountService,
  tokenService,
  activityService,
  recoverySharedService,
  backgroundUIService,
  chromeScheduleService,
  debounceService,
)
