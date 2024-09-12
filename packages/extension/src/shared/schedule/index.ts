import browser from "webextension-polyfill"
import { ChromeScheduleService } from "./ChromeScheduleService"

export const chromeScheduleService = new ChromeScheduleService(browser)
