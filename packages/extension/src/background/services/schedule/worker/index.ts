import browser from "webextension-polyfill"

import { ScheduleWorker } from "./ScheduleWorker"
import { chromeScheduleService } from "../../../../shared/schedule"

export const scheduleWorker = new ScheduleWorker(browser, chromeScheduleService)
