import { ampli } from "../../../shared/analytics"
import { settingsStore } from "../../../shared/settings/store"
import { backgroundUIService } from "../ui"
import { AnalyticsWoker } from "./AnalyticsWoker"

export const analyticsWorker = new AnalyticsWoker(
  ampli,
  backgroundUIService,
  settingsStore,
)
