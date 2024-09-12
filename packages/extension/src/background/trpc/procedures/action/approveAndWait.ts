import {
  actionHashSchema,
  actionItemExtraSchema,
} from "../../../../shared/actionQueue/schema"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"
import { z } from "zod"

const inputSchema = z.object({
  actionHash: actionHashSchema,
  extra: actionItemExtraSchema.optional(),
})

export const approveAndWaitActionProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(inputSchema)
  .mutation(async ({ input, ctx: { services } }) => {
    const { actionService } = services
    return actionService.approveAndWait(input)
  })
