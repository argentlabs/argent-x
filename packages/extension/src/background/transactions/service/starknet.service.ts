import {
  BaseTransactionTrackingService,
  TransactionTrackingService,
} from "./base"

import { IScheduleService } from "../../../shared/schedule/interface"
import { IChainService } from "../../../shared/chain/service/interface"
import {
  BaseTransaction,
  TransactionStatus,
} from "../../../shared/transactions/interface"
import {
  getTransactionIdentifier,
  getTransactionStatus,
  identifierToBaseTransaction,
} from "../../../shared/transactions/utils"
import { IRepository } from "../../../shared/storage/__new/interface"
import {
  Transaction,
  getInFlightTransactions,
} from "../../../shared/transactions"
import uniqWith from "lodash-es/uniqWith"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { getTransactionHistory } from "../sources/voyager"
import { getTransactionsUpdate } from "../sources/onchain"
import { transactionsStore } from "../../../shared/transactions/store"
import { accountService } from "../../../shared/account/service"
import { RefreshInterval } from "../../../shared/config"
import { pipe } from "../../__new/services/worker/schedule/pipe"
import { everyWhenOpen } from "../../__new/services/worker/schedule/decorators"
import { IBackgroundUIService } from "../../__new/services/ui/interface"
import { IDebounceService } from "../../../shared/debounce"

function isFinalStatus(status: TransactionStatus): boolean {
  return status.status === "confirmed" || status.status === "failed"
}

export class TransactionTrackerWorker
  extends BaseTransactionTrackingService<BaseTransaction, TransactionStatus>
  implements TransactionTrackingService<BaseTransaction, TransactionStatus>
{
  constructor(
    private readonly schedulingService: IScheduleService<
      | "starknetTransactionTracker"
      | "loadHistory"
      | "trackTransactionsUpdates"
      | "cleanupStaleTransactions"
    >,
    private readonly chainService: IChainService,
    private readonly transactionsRepo: IRepository<Transaction>,
    private readonly backgroundUIService: IBackgroundUIService,
    private readonly debounceService: IDebounceService,
  ) {
    super({ status: "pending" }, getTransactionIdentifier)

    void this.schedulingService.registerImplementation({
      id: "loadHistory",
      callback: this.loadHistory.bind(this),
    })

    void this.schedulingService.every(RefreshInterval.SLOW, {
      id: "loadHistory",
    })

    this.subscribeToRepoChange()
  }

  async cleanupStaleTransactions() {
    const now = Math.floor(Date.now() / 1000)

    const staleTransactions = await this.transactionsRepo.get((transaction) => {
      const { finality_status, execution_status } =
        getTransactionStatus(transaction)
      const isFailed =
        execution_status === "REVERTED" || finality_status === "REJECTED"
      const isSuccessful =
        finality_status === "ACCEPTED_ON_L2" ||
        finality_status === "ACCEPTED_ON_L1"

      const isPending = !isFailed && !isSuccessful
      const isStale = now - transaction.timestamp > 3600 // older than 1 hour
      return isStale && isPending
    })
    await this.transactionsRepo.remove(staleTransactions)
  }

  getStaleTransactions = (transaction: Transaction, now: number) => {
    const { finality_status, execution_status } =
      getTransactionStatus(transaction)
    const isFailed =
      execution_status === "REVERTED" || finality_status === "REJECTED"
    const isSuccessful =
      finality_status === "ACCEPTED_ON_L2" ||
      finality_status === "ACCEPTED_ON_L1"

    const isCompleted = isFailed || isSuccessful
    const isStale = now - transaction.timestamp > 60 // we keep the transaction for 1 minute after it's completed, so the subscribers can react to it
    return isCompleted && isStale
  }

  async cleanupTransactionStore() {
    const now = Math.floor(Date.now() / 1000)

    const staleTransactions = await this.transactionsRepo.get((transaction) =>
      this.getStaleTransactions(transaction, now),
    )
    await this.transactionsRepo.remove(staleTransactions)
  }

  async trackTransactionsUpdates() {
    await this.syncTransactionRepo()
  }

  runTrackTransactionUpdates = pipe(
    everyWhenOpen(
      this.backgroundUIService,
      this.schedulingService,
      this.debounceService,
      RefreshInterval.FAST,
      "TransactionTrackerWorker.trackTransactionsUpdates",
    ),
  )(async () => {
    try {
      await this.cleanupTransactionStore()
      await this.trackTransactionsUpdates()
      await this.update()
    } catch (error) {
      console.warn("Failed to update transactions", error)
    } finally {
      await this.cleanupStaleTransactions()
    }
  })

  protected async update() {
    const oldTransactionStatuses = Object.fromEntries(
      this.identifierToStatuses.entries(),
    )
    const baseTransactions = [...this.identifierToStatuses.keys()].map(
      identifierToBaseTransaction,
    )
    const updatedTransactions = await Promise.all(
      baseTransactions.map(async (tx) => {
        return this.chainService.getTransactionStatus(tx)
      }),
    )

    for (const tx of updatedTransactions) {
      // if status has changed compared to previous update, notify subscribers
      const oldStatus = oldTransactionStatuses[super.toIdentifier(tx)]
      if (oldStatus?.status !== tx.status.status) {
        this.callbacks.forEach((callback) => {
          callback({ transaction: tx, status: tx.status })
        })
      }

      // remove transaction from tracking if it's final
      if (isFinalStatus(tx.status)) {
        this.identifierToStatuses.delete(super.toIdentifier(tx))
      }
    }
  }

  async loadHistory() {
    const accountsToPopulate = await accountService.get()
    const allTransactions = await this.transactionsRepo.get()
    const uniqAccounts = uniqWith(accountsToPopulate, accountsEqual)
    const historyTransactions = await getTransactionHistory(
      uniqAccounts,
      allTransactions,
    )
    await this.transactionsRepo.upsert(historyTransactions)
  }
  async syncTransactionRepo() {
    const allTransactions = await this.transactionsRepo.get()

    const updatedTransactions = await getTransactionsUpdate(
      // is smart enough to filter for just the pending transactions, as the rest needs no update
      allTransactions,
    )
    await this.transactionsRepo.upsert(updatedTransactions)
    return getInFlightTransactions(allTransactions)
  }

  private subscribeToRepoChange() {
    const FAST_UPDATE_INTERVAL = 5 * 1000 // 5 seconds
    // Not sure why I cannot use the repo instead of the store here
    transactionsStore.subscribe((_, changeset) => {
      const oldTransactions = changeset.oldValue?.map((t) => t.hash) ?? []
      const newAddedTransactions =
        changeset.newValue
          ?.filter(({ hash }) => !oldTransactions.includes(hash))
          .filter((transaction) => {
            const { finality_status } = getTransactionStatus(transaction)
            return finality_status === "RECEIVED"
          }) ?? []

      if (newAddedTransactions.length > 0) {
        setTimeout(() => {
          const syncTxRepo = async () => {
            const inFlightTransactions = await this.syncTransactionRepo()
            // only update again if there are still in-flight transactions
            if (inFlightTransactions.length > 0) {
              setTimeout(() => {
                void this.syncTransactionRepo()
              }, FAST_UPDATE_INTERVAL)
            }
          }
          void syncTxRepo()
        }, FAST_UPDATE_INTERVAL)
      }
    })
  }
}
