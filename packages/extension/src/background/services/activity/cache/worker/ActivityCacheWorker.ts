import { isEqualAddress } from "@argent/x-shared"
import {
  AnyActivity,
  NativeActivity,
  NativeActivityTypeNative,
  createNativeActivity,
} from "@argent/x-shared/simulation"
import type Emittery from "emittery"
import { isEmpty } from "lodash-es"

import type { IActionQueue } from "../../../../../shared/actionQueue/queue/IActionQueue"
import type { ActionHash } from "../../../../../shared/actionQueue/schema"
import type { ActionItem } from "../../../../../shared/actionQueue/types"
import type { IActivityCacheService } from "../../../../../shared/activity/cache/IActivityCacheService"
import type { ActivitiesPayload } from "../../../../../shared/activity/types"
import { transformTransaction } from "../../../../../shared/activity/utils/transform"
import { getTransactionSubtitle } from "../../../../../shared/activity/utils/transform/transaction/getTransactionSubtitle"
import type { IAddressService } from "../../../../../shared/address/IAddressService"
import {
  TransactionCreatedForMultisigPendingTransaction,
  type MultisigEmitterEvents,
} from "../../../../../shared/multisig/emitter"
import type { MultisigPendingTransaction } from "../../../../../shared/multisig/pendingTransactionsStore"
import { getMultisigAccountFromBaseWallet } from "../../../../../shared/multisig/utils/baseMultisig"
import type { ArrayStorage } from "../../../../../shared/storage"
import type {
  IRepository,
  StorageChange,
} from "../../../../../shared/storage/__new/interface"
import type { Transaction } from "../../../../../shared/transactions"
import { getChangedStatusTransactions } from "../../../../../shared/transactions/getChangedStatusTransactions"
import {
  DAPP_TRANSACTION_TITLE,
  getNativeActivityStatusForTransaction,
} from "../../../../../shared/transactions/utils"
import { BaseWalletAccount } from "../../../../../shared/wallet.model"
import {
  TransactionCreatedForAction,
  type IBackgroundActionService,
} from "../../../action/IBackgroundActionService"
import { Activities, type IActivityService } from "../../IActivityService"
import { buildBasicActivitySummary } from "../../../../../shared/activity/utils/transform/activity/buildActivitySummary"

export class ActivityCacheWorker {
  constructor(
    private readonly activityService: IActivityService,
    private readonly activityCacheService: IActivityCacheService,
    private readonly transactionsRepo: IRepository<Transaction>,
    private readonly actionQueue: IActionQueue<ActionItem>,
    private readonly actionService: IBackgroundActionService,
    private readonly multisigEmitter: Emittery<MultisigEmitterEvents>,
    private readonly multisigPendingTransactionsStore: ArrayStorage<MultisigPendingTransaction>,
    private readonly addressService: IAddressService,
  ) {
    /** (...args) rather than bind() pattern so we can use spyOn() in tests */

    this.actionService.emitter.on(TransactionCreatedForAction, (...args) =>
      this.transactionCreatedForAction(...args),
    )

    this.transactionsRepo.subscribe((...args) =>
      this.onTransactionRepoChange(...args),
    )

    this.activityService.emitter.on(Activities, (...args) =>
      this.onActivities(...args),
    )

    this.multisigEmitter.on(
      TransactionCreatedForMultisigPendingTransaction,
      (...args) =>
        this.transactionCreatedForMultisigPendingTransaction(...args),
    )
  }

  async onActivities({ account, activities }: ActivitiesPayload) {
    if (isEmpty(activities)) {
      /**
       * don't set an empty array on the cache is this equates to 'fetched, but empty'
       * and will prevent the ui from requesting the 'initial fetch' on mount
       */
      return
    }
    await this.activityCacheService.upsertActivities({ account, activities })
  }

  async transactionCreatedForAction({
    actionHash,
    transactionHash,
  }: {
    actionHash: ActionHash
    transactionHash: string
  }) {
    const [transaction] = await this.transactionsRepo.get(
      (transaction) => transaction.hash === transactionHash,
    )
    const action = await this.actionQueue.get(actionHash)
    const transactionTransformed = transformTransaction({
      transaction,
      accountAddress: transaction.account.address,
    })

    if (transaction.account.type === "multisig") {
      const multisig = await getMultisigAccountFromBaseWallet(
        transaction.account,
      )
      /**
       * For a multisig with threshold > 1, add the action meta to the pending tx so it can be
       * used when creating a NativeAcivity for this tx later
       */
      if (multisig && multisig.threshold > 1) {
        const [multisigPendingTransaction] =
          await this.multisigPendingTransactionsStore.get((transaction) =>
            isEqualAddress(transaction.transactionHash, transactionHash),
          )
        if (multisigPendingTransaction && action?.meta) {
          const { title, subtitle, icon, transactionReview } = action.meta
          await this.multisigPendingTransactionsStore.push([
            {
              ...multisigPendingTransaction,
              meta: {
                ...multisigPendingTransaction.meta,
                title: transactionTransformed?.displayName || title, //  e.g. the action title for send is `Send 0.0001 ETH`, and we want  to show just `Sent`
                subtitle,
                icon,
                transactionReview,
              },
            },
          ])
        }
        /**
         * don't create a NativeActivity yet - it will happen naturally when the tx reaches threshold or is cancelled
         */
        return
      }
    }

    /** create a NativeActivity item by merging the action and the transation */
    if (transaction) {
      const status = getNativeActivityStatusForTransaction(transaction)
      const submitted = transaction.timestamp * 1000
      const lastModified = Date.now()
      const meta = action?.meta
      if (meta?.title === DAPP_TRANSACTION_TITLE) {
        /** removing this allows it to fallback to something more sensible than 'Review transaction' */
        delete meta?.title
      }
      const nativeActivity = createNativeActivity({
        simulateAndReview: action?.meta.transactionReview,
        meta,
        transaction,
        status,
        submitted,
        lastModified,
      })
      if (!nativeActivity.transferSummary) {
        const activitySummary = buildBasicActivitySummary(
          transactionTransformed,
        )
        nativeActivity.transferSummary = activitySummary
      }
      const { address, networkId } = transaction.account
      const account: BaseWalletAccount = {
        address,
        networkId,
      }
      await this.activityCacheService.upsertActivities({
        account,
        activities: [nativeActivity],
      })
    }
  }

  async transactionCreatedForMultisigPendingTransaction({
    requestId,
    transactionHash,
  }: {
    requestId: string
    transactionHash: string
  }) {
    const [transaction] = await this.transactionsRepo.get(
      (transaction) => transaction.hash === transactionHash,
    )
    const [multisigPendingTransaction] =
      await this.multisigPendingTransactionsStore.get(
        (transaction) => transaction.requestId === requestId,
      )
    /** create a NativeActivity item by merging the pending multisig transaction and the transation */
    if (transaction && multisigPendingTransaction) {
      const status = getNativeActivityStatusForTransaction(transaction)
      const submitted = transaction.timestamp * 1000
      const lastModified = Date.now()
      const fallbackMeta: NativeActivity["meta"] = {
        title: "Multisig Placeholder",
      }
      /**
       * If there is no meta title then this tx is not 'native' and came from multisig backend
       * FIXME: we have to use 'magic' `transformTransaction` here to derive a title and subtitle
       * ideally these should come from backend instead
       *
       * The following is very simplified code from `TransactionListItem` to get similar titles
       */
      const transactionTransformed = transformTransaction({
        transaction,
        accountAddress: transaction.account.address,
      })
      if (!multisigPendingTransaction.meta?.title) {
        if (transactionTransformed) {
          const getAddressName = this.addressService.getAddressName.bind(this)
          const subtitle = await getTransactionSubtitle({
            transactionTransformed,
            networkId: transaction.account.networkId,
            getAddressName,
          })
          if (transactionTransformed.displayName) {
            fallbackMeta.title = transactionTransformed.displayName
          }
          if (subtitle) {
            fallbackMeta.subtitle = subtitle
          }
          console.warn(
            "Applying locally generated ativity title and subtitle:",
            fallbackMeta,
          )
        }
      }
      const nativeActivity = createNativeActivity({
        simulateAndReview: multisigPendingTransaction.meta?.transactionReview,
        meta: {
          ...fallbackMeta,
          ...multisigPendingTransaction.meta,
        },
        transaction,
        status,
        submitted,
        lastModified,
      })
      if (!nativeActivity.transferSummary) {
        const activitySummary = buildBasicActivitySummary(
          transactionTransformed,
        )
        nativeActivity.transferSummary = activitySummary
      }
      const { address, networkId } = transaction.account
      const account: BaseWalletAccount = {
        address,
        networkId,
      }
      await this.activityCacheService.upsertActivities({
        account,
        activities: [nativeActivity],
      })
    }
  }

  async onTransactionRepoChange(changeSet: StorageChange<Transaction[]>) {
    const changedStatusTransactions = getChangedStatusTransactions(changeSet)
    if (!changedStatusTransactions || isEmpty(changedStatusTransactions)) {
      return
    }
    for (const changedStatusTransaction of changedStatusTransactions) {
      // get the original activity item and update its status and lastModified
      const activities = await this.activityCacheService.getCachedActivities(
        changedStatusTransaction.account,
      )
      const activity = activities?.find((activity) =>
        isEqualAddress(
          activity.transaction.hash,
          changedStatusTransaction.hash,
        ),
      )
      if (activity && activity.type === NativeActivityTypeNative) {
        const newStatus = getNativeActivityStatusForTransaction(
          changedStatusTransaction,
        )
        const updatedActivity: AnyActivity = {
          ...activity,
          status: newStatus,
          lastModified: Date.now(),
        }
        const { address, networkId } = changedStatusTransaction.account
        const account: BaseWalletAccount = {
          address,
          networkId,
        }
        await this.activityCacheService.upsertActivities({
          account,
          activities: [updatedActivity],
        })
      }
    }
  }
}
