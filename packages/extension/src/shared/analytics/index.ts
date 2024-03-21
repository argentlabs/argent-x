import { accountSharedService } from "../account/service"
import { settingsStore } from "../settings"
import { AnalyticsService } from "./implementation"

export const analyticsService = new AnalyticsService(
  accountSharedService,
  settingsStore,
)
