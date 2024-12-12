import { ActivityCacheWorker } from "./ActivityCacheWorker"
import { activityService } from "../.."
import { transactionsRepo } from "../../../../../shared/transactions/store"
import { actionQueue } from "../../../../../shared/actionQueue"
import { backgroundActionService } from "../../../action"
import { activityCacheService } from ".."
import { multisigEmitter } from "../../../../../shared/multisig/emitter"
import { multisigPendingTransactionsStore } from "../../../../../shared/multisig/pendingTransactionsStore"
import { addressService } from "../../../../../shared/address"
import { knownDappsService } from "../../../../../shared/knownDapps/index"

export const activityCacheWorker = new ActivityCacheWorker(
  activityService,
  activityCacheService,
  transactionsRepo,
  actionQueue,
  backgroundActionService,
  multisigEmitter,
  multisigPendingTransactionsStore,
  addressService,
  knownDappsService,
)
