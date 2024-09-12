import { starknetChainService } from "../../../../shared/chain/service"
import { chromeScheduleService } from "../../../../shared/schedule"
import { transactionsRepo } from "../../../../shared/transactions/store"
import { TransactionTrackerWorker, Events } from "./TransactionTrackerWorker"
import { debounceService } from "../../../../shared/debounce"
import { backgroundUIService } from "../../ui"
import Emittery from "emittery"

const emitter = new Emittery<Events>()

export const transactionTrackerWorker = new TransactionTrackerWorker(
  chromeScheduleService,
  starknetChainService,
  transactionsRepo,
  backgroundUIService,
  debounceService,
  emitter,
)
