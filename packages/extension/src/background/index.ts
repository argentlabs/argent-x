import "./__new/router"
import "./transactions/service/worker"
import "./migrations"

import { messageStream } from "../shared/messages"
import { initWorkers } from "./workers"
import { initBadgeText } from "./transactions/badgeText"
import { transactionTrackerWorker } from "./transactions/service/worker"
import { handleMessage } from "./messageHandling/handle"
import { addMessageListeners } from "./messageHandling/addMessageListeners"

// badge shown on extension icon
initBadgeText()

// load transaction history
transactionTrackerWorker
  .loadHistory()
  .catch(() => console.warn("failed to load transaction history"))

addMessageListeners()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
messageStream.subscribe(handleMessage)

// start workers
initWorkers()
