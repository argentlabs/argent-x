import { knownDappsService } from "../index"
import { chromeScheduleService } from "../../schedule"
import { KnownDappsWorker } from "./implementation"
import { backgroundUIService } from "../../../background/__new/services/ui"
import { debounceService } from "../../debounce"

export const knownDappsWorker = new KnownDappsWorker(
  chromeScheduleService,
  knownDappsService,
  backgroundUIService,
  debounceService,
)
