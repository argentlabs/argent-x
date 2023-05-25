import { TRPCError } from "@trpc/server"

import { procedure } from "../trpc"

// TODO: ⬇ should be service
function getOrigin(url: string) {
  const { origin } = new URL(url)
  return origin
}
function matchOrigin(urlToMatch: string, url?: string) {
  try {
    const matchOrigin = getOrigin(urlToMatch)
    if (!url) {
      return false
    }

    const origin = getOrigin(url)
    return origin === matchOrigin
  } catch {
    return false
  }
}

export const publicProcedure = procedure

export const extensionOnlyProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    const extensionUrl = chrome.runtime.getURL("")
    const sender = ctx.sender
    const senderUrl = sender?.url ?? sender?.origin
    if (!sender || !matchOrigin(extensionUrl, senderUrl)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Reserved for extension calls",
      })
    }

    return next({
      ctx: {
        ...ctx,
        sender, // by passing it after checking, every method after this middleware will have a mandatory sender
      },
    })
  },
)
