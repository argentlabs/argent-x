import { TRPCError } from "@trpc/server"

import { middleware } from "../trpc"

export const openSessionMiddleware = middleware(async ({ ctx, next }) => {
  if (!(await ctx.services.wallet.isSessionOpen())) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Open session needed",
    })
  }
  return next()
})
