import { chromeScheduleService } from "../../../../shared/schedule"
import { settingsStore } from "../../../../shared/settings"
import { backgroundUIService } from "../../../services/ui"
import { sessionService } from "../../../walletSingleton"
import { WalletSessionWorker } from "./WalletSessionWorker"

export const walletSessionWorker = new WalletSessionWorker(
  sessionService,
  chromeScheduleService,
  backgroundUIService,
  settingsStore,
)
