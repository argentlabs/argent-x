import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { enrichedSimulateAndReviewSchema } from "@argent/x-shared/simulation"
import { addressSchema } from "@argent/x-shared"
import {
  accountDeployTransactionSchema,
  transactionActionSchema,
} from "../../../../shared/transactionReview/transactionAction.model"

const simulateAndReviewSchema = z.object({
  feeTokenAddress: addressSchema,
  transaction: transactionActionSchema,
  accountDeployTransaction: accountDeployTransactionSchema.optional(),
  appDomain: z.string().optional(),
  maxSendEstimate: z.boolean().optional(),
})

export const simulateAndReviewProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(simulateAndReviewSchema)
  .output(enrichedSimulateAndReviewSchema)
  .query(async ({ input, ctx: { services } }) => {
    const { transactionReviewService } = services
    return transactionReviewService.simulateAndReview(input)
  })
