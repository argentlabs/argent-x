import { router } from "../../../trpc"
import { loadMoreProcedure } from "./loadMore"

export const activityCacheRouter = router({
  loadMore: loadMoreProcedure,
})
