import { createChromeHandler } from "trpc-extension/adapter"

import { globalActionQueueStore } from "../../shared/actionQueue/store"
import { ActionItem } from "../../shared/actionQueue/types"
import { getQueue } from "../actionQueue"
import { transactionTracker } from "../transactions/tracking"
import { walletSingleton } from "../walletSingleton"
import { accountRouter } from "./procedures/account"
import { networkRouter } from "./procedures/network"
import { recoveryRouter } from "./procedures/recovery"
import { router } from "./trpc"

const appRouter = router({
  account: accountRouter,
  network: networkRouter,
  recovery: recoveryRouter,
})

export type AppRouter = typeof appRouter

createChromeHandler({
  router: appRouter,
  createContext: async ({ req: port }) => ({
    sender: port.sender, // changes on every request
    services: {
      // services can be shared accross requests, as we usually only handle one user at a time
      wallet: walletSingleton, // wallet "service" is obviously way too big and should be split up
      actionQueue: await getQueue<ActionItem>(globalActionQueueStore),
      transactionTracker,
    },
  }),
})
