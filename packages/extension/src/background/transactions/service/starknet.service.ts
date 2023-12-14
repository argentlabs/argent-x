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
import { transactionsStore } from "../store"
import { accountService } from "../../../shared/account/service"
import { delay } from "../../../shared/utils/delay"
import { TransactionFinalityStatus } from "starknet"
import { RefreshInterval } from "../../../shared/config"

function isFinalStatus(status: TransactionStatus): boolean {
  return status.status === "confirmed" || status.status === "failed"
}

const DEFAULT_POLLING_INTERVAL = 15
const LOCAL_POLLING_INTERVAL = 5

export class TransactionTrackerWorker
  extends BaseTransactionTrackingService<BaseTransaction, TransactionStatus>
  implements TransactionTrackingService<BaseTransaction, TransactionStatus>
{
  constructor(
    private readonly schedulingService: IScheduleService<
      "starknetTransactionTracker" | "loadHistory" | "trackTransactionsUpdates"
    >,
    private readonly chainService: IChainService,
    private readonly transactionsRepo: IRepository<Transaction>,
  ) {
    super({ status: "pending" }, getTransactionIdentifier)

    void this.schedulingService.registerImplementation({
      id: "starknetTransactionTracker",
      callback: this.update.bind(this),
    })

    void this.schedulingService.registerImplementation({
      id: "loadHistory",
      callback: this.loadHistory.bind(this),
    })

    void this.schedulingService.registerImplementation({
      id: "trackTransactionsUpdates",
      callback: this.trackTransactionsUpdates.bind(this),
    })

    void this.schedulingService.every(RefreshInterval.FAST, {
      id: "starknetTransactionTracker",
    })
    void this.schedulingService.every(RefreshInterval.SLOW, {
      id: "loadHistory",
    })
    void this.schedulingService.every(RefreshInterval.MEDIUM, {
      id: "trackTransactionsUpdates",
    })
    this.subscribeToRepoChange()
  }

  async trackTransactionsUpdates() {
    // the config below will run transaction updates 4x per minute, if there are in-flight transactions
    // By default it will update on second 0, 15, 30 and 45 but by updating WAIT_TIME we can change the number of executions
    const maxExecutionTimeInMs = 60000 // 1 minute max execution time
    let transactionPollingIntervalInS = DEFAULT_POLLING_INTERVAL
    const startTime = Date.now()
    let inFlightTransactions = await this.syncTransactionRepo()
    while (
      inFlightTransactions.length > 0 &&
      Date.now() - startTime < maxExecutionTimeInMs
    ) {
      const localTransaction = inFlightTransactions.find(
        (tx) => tx.account.networkId === "localhost",
      )
      if (localTransaction) {
        transactionPollingIntervalInS = LOCAL_POLLING_INTERVAL
      } else {
        transactionPollingIntervalInS = DEFAULT_POLLING_INTERVAL
      }
      console.info(
        `~> waiting ${transactionPollingIntervalInS}s for transaction updates`,
      )
      await delay(transactionPollingIntervalInS * 1000)
      console.info(
        "~> fetching transaction updates as pending transactions were detected",
      )
      inFlightTransactions = await this.syncTransactionRepo()
    }
  }

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
          .filter(
            ({ finalityStatus }) =>
              finalityStatus === TransactionFinalityStatus.RECEIVED,
          ) ?? []

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
