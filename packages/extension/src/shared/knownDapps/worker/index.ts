import { knownDappsService } from "../index"
import { chromeScheduleService } from "../../schedule"
import { KnownDappsWorker } from "./implementation"

export const knownDappsWorker = new KnownDappsWorker(
  chromeScheduleService,
  knownDappsService,
)
