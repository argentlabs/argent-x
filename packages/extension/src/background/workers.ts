import { multisigWorker } from "./multisig/worker"
import { nftsWorker } from "./__new/services/nft/worker"
import { analyticsWorker } from "./__new/services/analytics"
import { networkWorker } from "./__new/services/network"
import { onboardingWorker } from "./__new/services/onboarding"
import { tokenWorker } from "./__new/services/token/worker"
import { accountWorker } from "./__new/services/account/worker"
import { knownDappsWorker } from "./__new/services/knownDapps/worker"
import { transactionReviewWorker } from "./__new/services/transactionReview/worker"
import { walletSessionWorker } from "./wallet/session/worker"
import { preAuthorisationWorker } from "./__new/services/preAuthorization/worker"
import { transactionsWorker } from "./__new/services/transactions/worker"

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
    walletSessionWorker,
    preAuthorisationWorker,
    transactionsWorker,
  }
}
