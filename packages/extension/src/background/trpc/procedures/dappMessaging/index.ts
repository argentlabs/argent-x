import { router } from "../../trpc"
import { connectDappProcedure } from "./connectDappProcedure"

export const dappMessagingRouter = router({
  connectDapp: connectDappProcedure,
})
