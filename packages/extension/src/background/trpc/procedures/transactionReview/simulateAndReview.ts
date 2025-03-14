import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { enrichedSimulateAndReviewV2Schema } from "@argent/x-shared/simulation"
import {
  accountDeployTransactionSchema,
  transactionActionSchema,
} from "../../../../shared/transactionReview/transactionAction.model"

const simulateAndReviewSchema = z.object({
  transaction: transactionActionSchema,
  accountDeployTransaction: accountDeployTransactionSchema.optional(),
  appDomain: z.string().optional(),
  maxSendEstimate: z.boolean().optional(),
})

export const simulateAndReviewProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(simulateAndReviewSchema)
  .output(enrichedSimulateAndReviewV2Schema)
  .query(async ({ input, ctx: { services } }) => {
    const { transactionReviewService } = services
    return transactionReviewService.simulateAndReview(input)
  })
