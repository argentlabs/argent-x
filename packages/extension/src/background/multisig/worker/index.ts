import { backgroundUIService } from "../../../background/__new/services/ui"
import { debounceService } from "../../../shared/debounce"
import { argentMultisigBackendService } from "../../../shared/multisig/service/backend"
import { networkService } from "../../../shared/network/service"
import { chromeScheduleService } from "../../../shared/schedule"
import { MultisigWorker } from "./implementation"

export const multisigWorker = new MultisigWorker(
  chromeScheduleService,
  argentMultisigBackendService,
  backgroundUIService,
  debounceService,
  networkService,
)
