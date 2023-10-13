import { router } from "../../trpc"
import { approveActionProcedure } from "./approve"
import { approveAndWaitActionProcedure } from "./approveAndWait"
import { rejectActionProcedure } from "./reject"
import { rejectAllActionsProcedure } from "./rejectAll"

export const actionRouter = router({
  approve: approveActionProcedure,
  approveAndWait: approveAndWaitActionProcedure,
  reject: rejectActionProcedure,
  rejectAll: rejectAllActionsProcedure,
})
