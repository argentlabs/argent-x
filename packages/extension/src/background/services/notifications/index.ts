import browser from "webextension-polyfill"

import { NotificationService } from "./NotificationService"
import { backgroundUIService } from "../ui"
import { accountSharedService } from "../../../shared/account/service"
import { sessionService } from "../../walletSingleton"

export const notificationService = new NotificationService(
  browser,
  backgroundUIService,
  accountSharedService,
  sessionService,
)
