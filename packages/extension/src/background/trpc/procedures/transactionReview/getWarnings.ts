import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const getWarningsProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .query(async ({ ctx: { services } }) => {
    const { transactionReviewService } = services
    return transactionReviewService.getWarnings()
  })
