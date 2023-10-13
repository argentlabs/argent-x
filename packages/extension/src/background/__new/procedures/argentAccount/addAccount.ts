import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const addAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .output(z.string())
  .mutation(
    async ({
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.addAccount()
    },
  )
