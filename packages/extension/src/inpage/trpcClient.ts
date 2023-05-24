import { createTRPCProxyClient } from "@trpc/client"
import { windowLink } from "trpc-extension/link"

import { AppRouter } from "../background/__new/router"

export const inpageMessageClient = createTRPCProxyClient<AppRouter>({
  links: [windowLink({ window })],
})
