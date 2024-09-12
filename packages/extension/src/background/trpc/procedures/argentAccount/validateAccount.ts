import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { flowSchema } from "../../../../shared/argentAccount/schema"

export const validateAccountProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(flowSchema)
  .mutation(
    async ({
      input: flow,
      ctx: {
        services: { argentAccountService },
      },
    }) => {
      return await argentAccountService.validateAccount(flow)
    },
  )
