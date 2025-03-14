import { z } from "zod"
import { flowSchema } from "../../../../shared/argentAccount/schema"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const validateAccountInputSchema = z.object({
  flow: flowSchema,
})

export const validateAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(validateAccountInputSchema)
  .mutation(
    async ({
      input: { flow },
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.validateAccount(flow)
    },
  )
