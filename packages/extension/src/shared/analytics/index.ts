import { accountSharedService } from "../account/service"
import { settingsStore } from "../settings"
import { AnalyticsService } from "./AnalyticsService"

// We name this ampli for the CI to properly check the usage of the analytics service
export const ampli = new AnalyticsService(accountSharedService, settingsStore)
