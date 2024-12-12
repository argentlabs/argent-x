import { createTRPCProxyClient } from "@trpc/client"
import { windowLink } from "trpc-browser/link"

import type { AppRouter } from "../background/trpc/router"
import superjson from "superjson"

export const inpageMessageClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [windowLink({ window })],
})
