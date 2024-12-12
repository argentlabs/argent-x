import {
  accountService,
  accountSharedService,
} from "../../../shared/account/service"
import { debounceService } from "../../../shared/debounce"
import {
  multisigBaseWalletRepo,
  multisigMetadataRepo,
} from "../../../shared/multisig/repository"
import { argentMultisigBackendService } from "../../../shared/multisig/service/backend"
import { networkService } from "../../../shared/network/service"
import { chromeScheduleService } from "../../../shared/schedule"
import { activityService } from "../../services/activity"
import { activityCacheService } from "../../services/activity/cache"
import { notificationService } from "../../services/notifications"
import { backgroundUIService } from "../../services/ui"
import { MultisigWorker } from "./MultisigWorker"

export const multisigWorker = new MultisigWorker(
  multisigBaseWalletRepo,
  multisigMetadataRepo,
  chromeScheduleService,
  argentMultisigBackendService,
  backgroundUIService,
  debounceService,
  accountService,
  accountSharedService,
  networkService,
  notificationService,
  activityCacheService,
  activityService,
)
