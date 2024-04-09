import { analyticsService } from "../../../../shared/analytics"
import { backgroundUIService } from "../ui"
import { AnalyticsWoker } from "./worker"

export const analyticsWorker = new AnalyticsWoker(
  analyticsService,
  backgroundUIService,
)
