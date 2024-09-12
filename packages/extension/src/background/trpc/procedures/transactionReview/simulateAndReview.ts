import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { transactionReviewTransactionsSchema } from "../../../../shared/transactionReview/interface"
import { enrichedSimulateAndReviewSchema } from "@argent/x-shared/simulation"
import { addressSchema } from "@argent/x-shared"

const simulateAndReviewSchema = z.object({
  feeTokenAddress: addressSchema,
  transactions: z.array(transactionReviewTransactionsSchema),
  appDomain: z.string().optional(),
})

export const simulateAndReviewProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(simulateAndReviewSchema)
  .output(enrichedSimulateAndReviewSchema)
  .query(async ({ input, ctx: { services } }) => {
    const { transactionReviewService } = services
    return transactionReviewService.simulateAndReview(input)
  })
