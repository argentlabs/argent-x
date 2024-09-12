import { openSessionMiddleware } from "../../../middleware/session"
import { extensionOnlyProcedure } from "../../permissions"
import { baseWalletAccountSchema } from "../../../../../shared/wallet.model"

export const loadMoreProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(baseWalletAccountSchema.optional())
  .mutation(async ({ input, ctx: { services } }) => {
    const { activityCacheService } = services
    return activityCacheService.loadMore(input)
  })
