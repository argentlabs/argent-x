import Emittery from "emittery"
import browser from "webextension-polyfill"

import { uiService } from "../../../../shared/__new/services/ui"
import { sessionService } from "../../../walletSingleton"
import BackgroundUIService from "./background"
import type { Events } from "./interface"

export { Opened } from "./interface"

const emitter = new Emittery<Events>()

export const backgroundUIService = new BackgroundUIService(
  emitter,
  browser,
  uiService,
  sessionService,
)
