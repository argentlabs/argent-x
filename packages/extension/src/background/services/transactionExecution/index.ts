import { TransactionExecutionService } from "./TransactionExecutionService"
import { transactionsRepo } from "../../../shared/transactions/store"
import { estimatedFeesRepo } from "../../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { paymasterService } from "../paymaster"
import { walletSingleton } from "../../walletSingleton"
import { investmentService } from "../investments"
import { nonceManagementService } from "../../nonceManagement"

export const transactionExecutor = new TransactionExecutionService(
  walletSingleton,
  paymasterService,
  investmentService,
  nonceManagementService,
  transactionsRepo,
  estimatedFeesRepo,
)
