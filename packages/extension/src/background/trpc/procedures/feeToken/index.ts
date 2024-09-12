import { router } from "../../trpc"
import { preferFeeTokenProcedure } from "./preferFeeToken"

export const feeTokenRouter = router({
  preferFeeToken: preferFeeTokenProcedure,
})
