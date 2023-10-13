import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const isTokenExpiredProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .output(z.boolean())
  .query(
    async ({
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.isTokenExpired()
    },
  )
