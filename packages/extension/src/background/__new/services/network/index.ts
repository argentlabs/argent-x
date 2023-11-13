import { debounceService } from "../../../../shared/debounce"
import { defaultNetworks } from "../../../../shared/network"
import { networkStatusRepo } from "../../../../shared/network/statusStore"
import { networkRepo } from "../../../../shared/network/store"
import { chromeScheduleService } from "../../../../shared/schedule"
import { backgroundUIService } from "../ui"
import BackgroundNetworkService from "./background"
import { getNetworkStatuses } from "./status"
import { NetworkWorker } from "./worker"

export const backgroundNetworkService = new BackgroundNetworkService(
  networkRepo,
  networkStatusRepo,
  defaultNetworks,
  getNetworkStatuses,
)

export const networkWorker = new NetworkWorker(
  backgroundNetworkService,
  backgroundUIService,
  chromeScheduleService,
  debounceService,
)
