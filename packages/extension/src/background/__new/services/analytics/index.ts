import { activeStore } from "../../../../shared/analytics"
import { backgroundUIService } from "../ui"
import { AnalyticsWorker } from "./worker"

export const analyticsWorker = new AnalyticsWorker(
  activeStore,
  backgroundUIService,
)
