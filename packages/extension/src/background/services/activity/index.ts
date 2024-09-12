import Emittery from "emittery"

import { ActivityService } from "./ActivityService"
import { activityStore } from "../../../shared/activity/storage"
import { httpService } from "../../../shared/http/singleton"
import { walletSingleton } from "../../walletSingleton"
import { chromeScheduleService } from "../../../shared/schedule"
import { backgroundUIService } from "../ui"
import { debounceService } from "../../../shared/debounce"
import type { Events } from "./IActivityService"
import { accountService } from "../../../shared/account/service"
import { tokenService } from "../../../shared/token/__new/service"
import { nftsContractsRepository } from "../../../shared/nft/store"
import { old_walletStore } from "../../../shared/wallet/walletStore"
import { ActivityWorker } from "./worker/ActivityWorker"
import { notificationService } from "../notifications"
import { transactionTrackerWorker } from "../transactionTracker/worker"
import { activityCacheService } from "./cache"

const emitter = new Emittery<Events>()

export const activityService = new ActivityService(
  emitter,
  activityStore,
  walletSingleton,
  accountService,
  tokenService,
  nftsContractsRepository,
  httpService,
  chromeScheduleService,
  backgroundUIService,
  debounceService,
  old_walletStore,
)

export const activityWorker = new ActivityWorker(
  activityService,
  notificationService,
  activityCacheService,
  transactionTrackerWorker,
)
