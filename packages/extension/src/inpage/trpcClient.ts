import { createTRPCProxyClient } from "@trpc/client"
import { windowLink } from "trpc-browser/link"

import { AppRouter } from "../background/__new/router"
import superjson from "superjson"

export const inpageMessageClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [windowLink({ window })],
})
