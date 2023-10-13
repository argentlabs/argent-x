import { createChromeHandler } from "trpc-browser/adapter"

import { getMessagingKeys } from "../keys/messagingKeys"
import { transactionTrackerWorker } from "../transactions/service/worker"
import { walletSingleton } from "../walletSingleton"
import { accountRouter } from "./procedures/account"
import { accountMessagingRouter } from "./procedures/accountMessaging"
import { actionRouter } from "./procedures/action"
import { addressBookRouter } from "./procedures/addressBook"
import { argentAccountRouter } from "./procedures/argentAccount"
import { multisigRouter } from "./procedures/multisig"
import { recoveryRouter } from "./procedures/recovery"
import { sessionRouter } from "./procedures/session"
import { tokensRouter } from "./procedures/tokens"
import { transferRouter } from "./procedures/transfer"
import { udcRouter } from "./procedures/udc"
import { backgroundActionService } from "./services/action"
import { backgroundArgentAccountService } from "./services/argentAccount"
import { backgroundMultisigService } from "./services/multisig"
import { router } from "./trpc"

const appRouter = router({
  account: accountRouter,
  accountMessaging: accountMessagingRouter,
  action: actionRouter,
  addressBook: addressBookRouter,
  recovery: recoveryRouter,
  tokens: tokensRouter,
  transfer: transferRouter,
  argentAccount: argentAccountRouter,
  multisig: multisigRouter,
  session: sessionRouter,
  udc: udcRouter,
})

export type AppRouter = typeof appRouter

createChromeHandler({
  router: appRouter,
  createContext: async ({ req: port }) => ({
    sender: port.sender, // changes on every request
    services: {
      // services can be shared accross requests, as we usually only handle one user at a time
      wallet: walletSingleton, // wallet "service" is obviously way too big and should be split up
      transactionTracker: transactionTrackerWorker,
      actionService: backgroundActionService,
      messagingKeys: await getMessagingKeys(),
      argentAccountService: backgroundArgentAccountService,
      multisigService: backgroundMultisigService,
    },
  }),
})
