import { router } from "../../trpc"
import { getTopperUrlProcedure } from "./getTopperUrl"

export const onRampRouter = router({
  getTopperUrl: getTopperUrlProcedure,
})
