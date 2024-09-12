import { TRPCError } from "@trpc/server"

import { procedure } from "../trpc"
import { preAuthorizationService } from "../../../shared/preAuthorization"

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

export const connectedDappsProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    const sender = ctx.sender
    const senderUrl = sender?.url ?? sender?.origin
    const origin = senderUrl && getOrigin(senderUrl)
    const account = await ctx.services.wallet.getSelectedAccount()

    const isPreauthorized = await preAuthorizationService.isPreAuthorized({
      account,
      host: origin,
    })

    const extensionUrl = chrome.runtime.getURL("")
    const fromExtension = matchOrigin(extensionUrl, senderUrl)

    const isFromPreauthorizedDappOrExtension = isPreauthorized || fromExtension

    if (!sender || !isFromPreauthorizedDappOrExtension) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Reserved for preauthorized calls or extension",
      })
    }

    const senderType = isPreauthorized
      ? ("preauthorized" as const)
      : ("extension" as const)

    return next({
      ctx: {
        ...ctx,
        sender, // by passing it after checking, every method after this middleware will have a mandatory sender
        senderType,
      },
    })
  },
)

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
