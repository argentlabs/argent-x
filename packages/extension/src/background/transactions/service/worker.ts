import { starknetChainService } from "../../../shared/chain/service"
import { chromeScheduleService } from "../../../shared/schedule"
import { transactionsRepo } from "../store"
import { TransactionTrackerWorker } from "./starknet.service"

export const transactionTrackerWorker = new TransactionTrackerWorker(
  chromeScheduleService,
  starknetChainService,
  transactionsRepo,
)
