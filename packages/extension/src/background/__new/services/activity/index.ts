import urlJoin from "url-join"
import { ARGENT_API_BASE_URL } from "../../../../shared/api/constants"
import { ActivityService } from "./implementation"
import { activityStore } from "../../../../shared/activity/storage"

const activityBaseUrl = urlJoin(ARGENT_API_BASE_URL || "", "/activity/starknet")

export const activityService = new ActivityService(
  activityBaseUrl,
  activityStore,
  {
    "argent-version": process.env.VERSION ?? "Unknown version",
    "argent-client": "argent-x",
  },
)
