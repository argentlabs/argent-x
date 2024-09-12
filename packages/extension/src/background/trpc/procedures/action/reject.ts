import { z } from "zod"

import { actionHashSchema } from "../../../../shared/actionQueue/schema"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const inputSchema = actionHashSchema.or(z.array(actionHashSchema))

export const rejectActionProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(inputSchema)
  .mutation(async ({ input, ctx: { services } }) => {
    const { actionService } = services
    return actionService.reject(input)
  })
