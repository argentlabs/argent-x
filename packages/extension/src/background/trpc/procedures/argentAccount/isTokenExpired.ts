import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const isTokenExpiredProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(z.object({ initiator: z.string() }))
  .output(z.boolean())
  .query(
    async ({
      input,
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.isTokenExpired({
        initiator: input.initiator,
      })
    },
  )
