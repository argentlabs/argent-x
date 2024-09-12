import { backgroundUIService } from "../../services/ui"
import { debounceService } from "../../../shared/debounce"
import { argentMultisigBackendService } from "../../../shared/multisig/service/backend"
import { networkService } from "../../../shared/network/service"
import { chromeScheduleService } from "../../../shared/schedule"
import { MultisigWorker } from "./MultisigWorker"
import { notificationService } from "../../services/notifications"
import { accountService } from "../../../shared/account/service"

export const multisigWorker = new MultisigWorker(
  chromeScheduleService,
  argentMultisigBackendService,
  backgroundUIService,
  debounceService,
  accountService,
  networkService,
  notificationService,
)
