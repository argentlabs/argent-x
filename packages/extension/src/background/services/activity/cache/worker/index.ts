import { ActivityCacheWorker } from "./ActivityCacheWorker"
import { activityService } from "../.."
import { transactionsRepo } from "../../../../../shared/transactions/store"
import { actionQueue } from "../../../../../shared/actionQueue"
import { backgroundActionService } from "../../../action"
import { activityCacheService } from ".."
import { isActivityV2FeatureEnabled } from "../../../../../shared/activity"
import { multisigEmitter } from "../../../../../shared/multisig/emitter"
import { multisigPendingTransactionsStore } from "../../../../../shared/multisig/pendingTransactionsStore"
import { addressService } from "../../../../../shared/address"

export const activityCacheWorker =
  isActivityV2FeatureEnabled &&
  new ActivityCacheWorker(
    activityService,
    activityCacheService,
    transactionsRepo,
    actionQueue,
    backgroundActionService,
    multisigEmitter,
    multisigPendingTransactionsStore,
    addressService,
  )
