import { actionHashSchema } from "../../../../shared/actionQueue/schema"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const clearActionErrorProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(actionHashSchema)
  .mutation(async ({ input, ctx: { services } }) => {
    const { actionService } = services
    return actionService.clearActionError(input)
  })
