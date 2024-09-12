import { disconnectProcedure } from "./disconnect"
import { router } from "../../trpc"

export const preAuthorizationRouter = router({
  disconnect: disconnectProcedure,
})
