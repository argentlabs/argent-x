import { debounceService } from "../../../shared/debounce"
import { httpService } from "../../../shared/http/singleton"
import { defaultNetworks } from "../../../shared/network"
import { networkStatusRepo } from "../../../shared/network/statusStore"
import { networkRepo } from "../../../shared/network/store"
import { chromeScheduleService } from "../../../shared/schedule"
import { backgroundUIService } from "../ui"
import BackgroundNetworkService from "./BackgroundNetworkService"
import { NetworkWorker } from "./worker/NetworkWorker"

export const backgroundNetworkService = new BackgroundNetworkService(
  networkRepo,
  networkStatusRepo,
  defaultNetworks,
  httpService,
)

export const networkWorker = new NetworkWorker(
  backgroundNetworkService,
  backgroundUIService,
  chromeScheduleService,
  debounceService,
)
