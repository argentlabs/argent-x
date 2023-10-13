import { z } from "zod"

import {
  actionHashSchema,
  actionQueueItemSchema,
} from "../../../../shared/actionQueue/schema"
import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

const approveActionSchema = z.union([actionQueueItemSchema, actionHashSchema])

export const approveActionProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(approveActionSchema)
  .mutation(async ({ input, ctx: { services } }) => {
    const { actionService } = services
    return actionService.approve(input)
  })
