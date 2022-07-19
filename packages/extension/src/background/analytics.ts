import { getAnalytics } from "../shared/analytics"
import { fetchWithTimeout } from "./utils/fetchWithTimeout"

import { useNetworkLogs } from "./../ui/features/settings/networkLogs.state"

const [ , addNetworkLog] = useNetworkLogs()
export const analytics = getAnalytics(fetchWithTimeout, addNetworkLog)
