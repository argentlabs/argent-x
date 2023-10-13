import browser from "webextension-polyfill"
import { ChromeScheduleService } from "./chromeService"

export const chromeScheduleService = new ChromeScheduleService(browser)
