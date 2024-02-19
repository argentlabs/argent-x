import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { discoverService } from "../../services/discover"
import { extensionOnlyProcedure } from "../permissions"

export const viewedAtProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(z.number())
  .mutation(async ({ input }) => {
    return discoverService.setViewedAt(input)
  })
