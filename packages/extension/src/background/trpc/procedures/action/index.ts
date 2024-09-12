import { router } from "../../trpc"
import { approveActionProcedure } from "./approve"
import { approveAndWaitActionProcedure } from "./approveAndWait"
import { clearActionErrorProcedure } from "./clearActionError"
import { rejectActionProcedure } from "./reject"
import { rejectAllActionsProcedure } from "./rejectAll"
import { updateTransactionReviewProcedure } from "./updateTransactionReview"

export const actionRouter = router({
  approve: approveActionProcedure,
  approveAndWait: approveAndWaitActionProcedure,
  reject: rejectActionProcedure,
  rejectAll: rejectAllActionsProcedure,
  updateTransactionReview: updateTransactionReviewProcedure,
  clearActionError: clearActionErrorProcedure,
})
