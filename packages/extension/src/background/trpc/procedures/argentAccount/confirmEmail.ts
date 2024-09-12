import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const confirmEmailSchema = z.object({
  code: z.string(),
})

export const confirmEmailProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(confirmEmailSchema)
  .mutation(
    async ({
      input: { code },
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.confirmEmail(code)
    },
  )
