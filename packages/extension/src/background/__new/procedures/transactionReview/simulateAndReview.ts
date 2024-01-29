import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { transactionReviewTransactionsSchema } from "../../../../shared/transactionReview/interface"
import { enrichedSimulateAndReviewSchema } from "../../../../shared/transactionReview/schema"

const simulateAndReviewSchema = z.array(transactionReviewTransactionsSchema)

export const simulateAndReviewProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(simulateAndReviewSchema)
  .output(enrichedSimulateAndReviewSchema)
  .query(async ({ input, ctx: { services } }) => {
    const { transactionReviewService } = services
    return transactionReviewService.simulateAndReview({
      transactions: input,
    })
  })
