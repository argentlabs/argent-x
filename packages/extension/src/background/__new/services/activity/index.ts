import Emittery from "emittery"

import { ActivityService } from "./implementation"
import { activityStore } from "../../../../shared/activity/storage"
import { httpService } from "../../../../shared/http/singleton"
import { walletSingleton } from "../../../walletSingleton"
import { chromeScheduleService } from "../../../../shared/schedule"
import { backgroundUIService } from "../ui"
import { debounceService } from "../../../../shared/debounce"
import type { Events } from "./interface"
import { accountService } from "../../../../shared/account/service"
import { tokenService } from "../../../../shared/token/__new/service"
import { nftsContractsRepository } from "../../../../shared/storage/__new/repositories/nft"

export { Activities as Activities } from "./interface"

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
)
