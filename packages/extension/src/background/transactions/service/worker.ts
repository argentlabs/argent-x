import { starknetChainService } from "../../../shared/chain/service"
import { chromeScheduleService } from "../../../shared/schedule"
import { transactionsRepo } from "../../../shared/transactions/store"
import { TransactionTrackerWorker } from "./starknet.service"
import { debounceService } from "../../../shared/debounce"
import { backgroundUIService } from "../../__new/services/ui"

export const transactionTrackerWorker = new TransactionTrackerWorker(
  chromeScheduleService,
  starknetChainService,
  transactionsRepo,
  backgroundUIService,
  debounceService,
)
