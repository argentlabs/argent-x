import { Provider } from "starknet"

import { BackupWallet } from "../shared/backup.model"
import { getProvider } from "../shared/networks"
import {
  FetchedTransactionStatus,
  TransactionListener,
  TransactionMeta,
  TransactionStatus,
  TransactionStatusWithProvider,
} from "../shared/transactions.model"

export async function getTransactionStatus(
  provider: Provider,
  hash: string,
): Promise<FetchedTransactionStatus> {
  // TODO: starknet.js hasn't typed `tx_failure_reason` yet, remove this ugly `any` when it's added
  const { tx_status, tx_failure_reason }: any =
    await provider.getTransactionStatus(hash)
  return { hash, status: tx_status, failureReason: tx_failure_reason }
}

export class TransactionTracker {
  private transactions: TransactionStatusWithProvider[] = []
  private listeners: TransactionListener[] = []
  private interval: NodeJS.Timeout

  constructor(listen: TransactionListener, interval: number = 30 * 1000) {
    this.listeners = [listen]
    this.interval = setInterval(() => this.checkTransactions(), interval)
  }

  public async trackTransaction(
    transactionHash: string,
    wallet: BackupWallet,
    meta: TransactionMeta = {
      title: "Contract interaction",
    },
  ): Promise<void> {
    try {
      const provider = getProvider(wallet.network)
      this.transactions.push({
        hash: transactionHash,
        provider,
        walletAddress: wallet.address,
        status: "RECEIVED",
        meta,
      })

      this.listeners.forEach((listen) => {
        listen(this.transactions)
      })
    } catch (e) {
      console.error("Failed to track transaction", e)
    }
  }

  public getAllTransactions(byWalletAddress?: string): TransactionStatus[] {
    return this.transactions
      .filter(
        (transaction) =>
          !byWalletAddress || transaction.walletAddress === byWalletAddress,
      )
      .map(({ hash, walletAddress, meta }) => ({
        hash,
        walletAddress,
        status: this.getTransactionStatus(hash)?.status || "NOT_RECEIVED",
        meta,
      }))
  }

  public getTransactionStatus(hash: string): TransactionStatus | undefined {
    return this.transactions.find(({ hash: txHash }) => txHash === hash)
  }

  private async checkTransactions(): Promise<void> {
    const promises = this.transactions.map(
      async ({
        hash,
        provider,
        walletAddress,
        meta,
        status,
        failureReason,
      }) => {
        // TODO: We dont need to check for ACCEPTED_ON_L1 currently, as we just handle ACCEPTED_ON_L2 anyways. This may changes in the future.
        // if (status === "ACCEPTED_ON_L1" || status === "REJECTED") {
        if (status === "ACCEPTED_ON_L2" || status === "REJECTED") {
          return {
            hash,
            provider,
            walletAddress,
            meta,
            status,
            failureReason,
          }
        }
        const result = await getTransactionStatus(provider, hash)
        return { ...result, walletAddress, provider, meta }
      },
    )

    const transactionStatuses = await Promise.all(promises)
    if (transactionStatuses.length > 0) {
      // add transactions that were added while we were fetching
      this.transactions = [
        ...transactionStatuses,
        ...this.transactions.filter(
          (transactionStatus) =>
            !transactionStatuses.find(
              ({ hash }) => hash === transactionStatus.hash,
            ),
        ),
      ]
      this.listeners.forEach((listen) => {
        listen(this.transactions)
      })
    }
  }

  public addListener(listen: TransactionListener): void {
    this.listeners.push(listen)
  }

  public removeListener(listen: TransactionListener): void {
    this.listeners = this.listeners.filter((other) => other !== listen)
  }

  public async stop(): Promise<void> {
    clearInterval(this.interval)
  }
}
