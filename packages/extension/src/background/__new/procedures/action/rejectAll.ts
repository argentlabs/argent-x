import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

export const rejectAllActionsProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .mutation(async ({ ctx: { services } }) => {
    const { actionService } = services
    return actionService.rejectAll()
  })
