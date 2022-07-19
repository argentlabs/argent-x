import { getAnalytics } from "../shared/analytics"
import { fetchWithTimeout } from "./utils/fetchWithTimeout"

export const analytics = getAnalytics(fetchWithTimeout)
