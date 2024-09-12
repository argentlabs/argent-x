import "./trpc/router"
import "./migrations"

import { messageStream } from "../shared/messages"
import { initWorkers } from "./workers"
import { initBadgeText } from "./transactions/badgeText"
import { transactionTrackerWorker } from "./services/transactionTracker/worker"
import { handleMessage } from "./messageHandling/handle"
import { addMessageListeners } from "./messageHandling/addMessageListeners"
import { chromeScheduleService } from "../shared/schedule"
import { IS_DEV } from "../shared/utils/dev"

// uncomment to check background error handling
// throw new Error("error for testing")

// badge shown on extension icon
initBadgeText()

// load transaction history
void chromeScheduleService.onStartup({
  id: "loadTransactionHistory",
  callback: () => transactionTrackerWorker.loadHistory(),
})

addMessageListeners()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
messageStream.subscribe(handleMessage)

// start workers
initWorkers()

// hot reload in development
if (IS_DEV) {
  require("./dev/hotReload")
}
