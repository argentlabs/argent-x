import { multisigWorker } from "./multisig/worker"
import { nftsWorker } from "./services/nft/worker"
import { networkWorker } from "./services/network"
import { onboardingWorker } from "./services/onboarding"
import { tokenWorker } from "./services/token/worker"
import { accountWorker } from "./services/account/worker"
import { knownDappsWorker } from "./services/knownDapps/worker"
import { transactionReviewWorker } from "./services/transactionReview/worker"
import { walletSessionWorker } from "./wallet/session/worker"
import { transactionsWorker } from "./services/transactions/worker"
import { scheduleWorker } from "./services/schedule/worker"
import { analyticsWorker } from "./services/analytics"
import { activityCacheWorker } from "./services/activity/cache/worker"
import { activityWorker } from "./services/activity"

/** TODO: refactor: remove this facade */
export function initWorkers() {
  return {
    onboardingWorker,
    accountWorker,
    tokenWorker,
    nftsWorker,
    multisigWorker,
    networkWorker,
    knownDappsWorker,
    transactionReviewWorker,
    walletSessionWorker,
    transactionsWorker,
    scheduleWorker,
    analyticsWorker,
    activityCacheWorker,
    activityWorker,
  }
}
