import { router } from "../../trpc"
import { estimateAccountDeployProcedure } from "./accountDeploy"
import { estimateTransactionProcedure } from "./estimate"

export const transactionEstimateRouter = router({
  estimateTransaction: estimateTransactionProcedure,
  estimateAccountDeploy: estimateAccountDeployProcedure,
})
