import { z } from "zod"

import { actionHashSchema } from "../../../../shared/actionQueue/schema"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { simulateAndReviewSchema } from "@argent/x-shared/simulation"

const inputSchema = z.object({
  actionHash: actionHashSchema,
  transactionReview: simulateAndReviewSchema,
})

export const updateTransactionReviewProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(inputSchema)
  .mutation(async ({ input, ctx: { services } }) => {
    const { actionService } = services
    return actionService.updateTransactionReview(input)
  })
