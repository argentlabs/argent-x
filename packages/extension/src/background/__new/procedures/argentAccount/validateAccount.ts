import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const validateAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .mutation(
    async ({
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.validateAccount()
    },
  )
