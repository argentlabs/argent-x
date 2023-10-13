import { StarknetMethodArgumentsSchemas } from "@argent/x-window"
import type { CreateTRPCProxyClient } from "@trpc/client"
import { createTRPCProxyClient, splitLink, loggerLink } from "@trpc/client"
import { initTRPC } from "@trpc/server"
import { popupLink, windowLink } from "trpc-browser/link"
import { z } from "zod"

const t = initTRPC.create({
  isServer: false,
  allowOutsideOfServer: true,
})

// TODO: abstract AppRouter in order to have one single source of truth
// At the moment, this is needed
const appRouter = t.router({
  authorize: t.procedure.output(z.boolean()).mutation(async () => {
    return true
  }),
  connect: t.procedure.mutation(async () => ""),
  enable: t.procedure.output(z.string()).mutation(async () => ""),
  execute: t.procedure
    .input(StarknetMethodArgumentsSchemas.execute)
    .output(z.string())
    .mutation(async () => ""),
  signMessage: t.procedure
    .input(StarknetMethodArgumentsSchemas.signMessage)
    .output(z.string().array())
    .mutation(async () => []),
  getLoginStatus: t.procedure
    .output(
      z.object({
        isLoggedIn: z.boolean(),
        hasSession: z.boolean().optional(),
        isPreauthorized: z.boolean().optional(),
      }),
    )
    .mutation(async () => {
      // placeholder
      return {
        isLoggedIn: true,
      }
    }),
  addStarknetChain: t.procedure.mutation((_) => {
    throw Error("not implemented")
  }),
  switchStarknetChain: t.procedure.mutation((_) => {
    throw Error("not implemented")
  }),
  watchAsset: t.procedure.mutation((_) => {
    throw Error("not implemented")
  }),
  updateModal: t.procedure.subscription(async () => {
    return
  }),
})

export type AppRouter = typeof appRouter

type TRPCProxyClientOptions = {
  origin: string
  iframe?: Window
}

export const trpcProxyClient = ({
  iframe,
  origin,
}: TRPCProxyClientOptions): CreateTRPCProxyClient<AppRouter> =>
  createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) => {
          return (
            (process.env.NODE_ENV === "development" &&
              typeof window !== "undefined") ||
            (process.env.NODE_ENV === "development" &&
              opts.direction === "down" &&
              opts.result instanceof Error)
          )
        },
      }),
      splitLink({
        condition(opts) {
          // throw if iframe is not defined & type is subscription
          if (!iframe && opts.type === "subscription") {
            throw new Error(
              "subscription is not supported without an iframe window",
            )
          }

          // equal needed for typescript check
          return Boolean(iframe)
        },
        true: windowLink({
          window: window,
          postWindow: iframe,
          postOrigin: "*",
        }),
        false: popupLink({
          listenWindow: window,
          createPopup: () => {
            const h = 562
            const w = 886

            // parent is the window that opened this window; if not detected then it falls back to the current screen
            const parentWidth =
              window?.outerWidth ??
              window?.innerWidth ??
              window?.screen.width ??
              0
            const parentHeight =
              window?.outerHeight ??
              window?.innerHeight ??
              window?.screen.height ??
              0
            const parentLeft = window?.screenLeft ?? window?.screenX ?? 0
            const parentTop = window?.screenTop ?? window?.screenY ?? 0

            const y = parentTop + parentHeight / 2 - h / 2
            const x = parentLeft + parentWidth / 2 - w / 2
            const popup = window.open(
              `${origin}/interstitialLogin`,
              "popup",
              `width=${w},height=${h},top=${y},left=${x},toolbar=no,menubar=no,scrollbars=no,location=no,status=no,popup=1`,
            )
            if (!popup) {
              throw new Error("Could not open popup")
            }
            return popup
          },
          postOrigin: "*",
        }),
      }),
    ],
  })
