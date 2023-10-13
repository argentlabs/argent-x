import browser from "webextension-polyfill"

import { uiService } from "../../../shared/__new/services/ui"
import ClientUIService from "./client"

export const clientUIService = new ClientUIService(browser, uiService)
