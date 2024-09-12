import { debounceService } from "../../../shared/debounce"
import { discoverStore } from "../../../shared/discover/storage"
import { httpService } from "../../../shared/http/singleton"
import { chromeScheduleService } from "../../../shared/schedule"
import { backgroundUIService } from "../ui"
import { DiscoverService } from "./DiscoverService"

export const discoverService = new DiscoverService(
  discoverStore,
  httpService,
  chromeScheduleService,
  backgroundUIService,
  debounceService,
)
