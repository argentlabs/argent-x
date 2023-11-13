import { recoveryStore } from "../../../../shared/recovery/storage"
import { transactionTrackerWorker } from "../../../transactions/service/worker"
import { walletSingleton } from "../../../walletSingleton"
import { BackgroundRecoveryService } from "./implementation"

export const backgroundRecoveryService = new BackgroundRecoveryService(
  recoveryStore,
  walletSingleton,
  transactionTrackerWorker,
)
