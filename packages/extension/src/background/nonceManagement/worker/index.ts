import { nonceManagementService } from ".."
import { transactionsRepo } from "../../../shared/transactions/store"
import { NonceManagementWorker } from "./NonceManagementWorker"

export const nonceManagementWorker = new NonceManagementWorker(
  transactionsRepo,
  nonceManagementService,
)
