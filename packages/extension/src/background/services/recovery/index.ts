import { recoveryStore } from "../../../shared/recovery/storage"
import { transactionTrackerWorker } from "../transactionTracker/worker"
import { walletSingleton } from "../../walletSingleton"
import { BackgroundRecoveryService } from "./BackgroundRecoveryService"

export const backgroundRecoveryService = new BackgroundRecoveryService(
  recoveryStore,
  walletSingleton,
  transactionTrackerWorker,
)
