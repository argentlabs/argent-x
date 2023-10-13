import { networkService } from "../../network/service"
import { chromeScheduleService } from "../../schedule"
import { argentMultisigBackendService } from "../service/backend"
import { MultisigWorker } from "./implementation"

export const multisigWorker = new MultisigWorker(
  chromeScheduleService,
  argentMultisigBackendService,
  networkService,
)
