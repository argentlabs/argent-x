import { createTRPCProxyClient } from "@trpc/client"
import { chromeLink } from "trpc-browser/link"
import browser from "webextension-polyfill"

import type { AppRouter } from "../../../background/__new/router"

const port = browser.runtime.connect()
export const messageClient = createTRPCProxyClient<AppRouter>({
  links: [chromeLink({ port })],
})
