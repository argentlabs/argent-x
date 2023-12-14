import { multisigWorker } from "./multisig/worker"
import { nftsWorker } from "./__new/services/nft/worker"
import { analyticsWorker } from "./__new/services/analytics"
import { networkWorker } from "./__new/services/network"
import { onboardingWorker } from "./__new/services/onboarding"
import { tokenWorker } from "../shared/token/__new/worker"
import { accountWorker } from "../shared/account/worker"
import { knownDappsWorker } from "./../shared/knownDapps/worker"
import { transactionReviewWorker } from "./__new/services/transactionReview/worker"

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
    analyticsWorker,
    transactionReviewWorker,
  }
}
