import { router } from "../../trpc"
import { addNetworkProcedure } from "./add"

export const networkRouter = router({
  add: addNetworkProcedure,
})
