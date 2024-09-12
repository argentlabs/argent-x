import { ActivityCacheService } from "./ActivityCacheService"
import { httpService } from "../../../../shared/http/singleton"
import { activityCacheStore } from "../../../../shared/activity/cache/storage"
import { backgroundUIService } from "../../ui"

export const activityCacheService = new ActivityCacheService(
  activityCacheStore,
  httpService,
  backgroundUIService,
)
