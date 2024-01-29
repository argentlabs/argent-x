import { debounceService } from "../../../../../shared/debounce"
import { knownDappsService } from "../../../../../shared/knownDapps/index"
import { chromeScheduleService } from "../../../../../shared/schedule"
import { backgroundUIService } from "../../ui"
import { KnownDappsWorker } from "./implementation"

export const knownDappsWorker = new KnownDappsWorker(
  chromeScheduleService,
  knownDappsService,
  backgroundUIService,
  debounceService,
)
