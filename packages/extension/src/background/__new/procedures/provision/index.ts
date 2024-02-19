import { router } from "../../trpc"
import { getStatusProcedure } from "./getStatus"

export const provisionRouter = router({
  getStatus: getStatusProcedure,
})
