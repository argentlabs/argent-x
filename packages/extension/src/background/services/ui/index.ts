import Emittery from "emittery"
import browser from "webextension-polyfill"

import { uiService } from "../../../shared/ui"
import { sessionService } from "../../walletSingleton"
import BackgroundUIService from "./BackgroundUIService"
import type { Events } from "./IBackgroundUIService"
import { old_walletStore } from "../../../shared/wallet/walletStore"

export { Opened } from "./IBackgroundUIService"

const emitter = new Emittery<Events>()

export const backgroundUIService = new BackgroundUIService(
  emitter,
  browser,
  uiService,
  sessionService,
  old_walletStore,
)
