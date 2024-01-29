import { chromeScheduleService } from "../../../../shared/schedule"
import { settingsStore } from "../../../../shared/settings"
import { backgroundUIService } from "../../../__new/services/ui"
import { sessionService } from "../../../walletSingleton"
import { WalletSessionWorker } from "./implementation"

export const walletSessionWorker = new WalletSessionWorker(
  sessionService,
  chromeScheduleService,
  backgroundUIService,
  settingsStore,
)
