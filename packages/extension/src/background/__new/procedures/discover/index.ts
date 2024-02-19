import { router } from "../../trpc"
import { viewedAtProcedure } from "./viewedAt"

export const discoverRouter = router({
  viewedAt: viewedAtProcedure,
})
