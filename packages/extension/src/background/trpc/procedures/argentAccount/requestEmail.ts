import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const requestEmailSchema = z.object({
  email: z.string(),
})

export const requestEmailProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(requestEmailSchema)
  .mutation(
    async ({
      input: { email },
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.requestEmail(email)
    },
  )
