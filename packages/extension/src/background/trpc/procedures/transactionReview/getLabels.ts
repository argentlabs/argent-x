import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const getLabelsProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .query(async ({ ctx: { services } }) => {
    const { transactionReviewService } = services
    return transactionReviewService.getLabels()
  })
