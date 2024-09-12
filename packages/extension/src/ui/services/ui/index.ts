import browser from "webextension-polyfill"
import Emittery from "emittery"

import { uiService } from "../../../shared/ui"
import ClientUIService from "./ClientUIService"
import type { Events } from "./IClientUIService"

const emitter = new Emittery<Events>()

export const clientUIService = new ClientUIService(emitter, browser, uiService)
