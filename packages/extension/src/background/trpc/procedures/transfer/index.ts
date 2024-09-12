import { router } from "../../trpc"
import { sendProcedure } from "./send"

export const transferRouter = router({
  send: sendProcedure,
})
