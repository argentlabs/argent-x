import { ampli } from "../../../shared/analytics"
import { backgroundUIService } from "../ui"
import { AnalyticsWoker } from "./AnalyticsWoker"

export const analyticsWorker = new AnalyticsWoker(ampli, backgroundUIService)
