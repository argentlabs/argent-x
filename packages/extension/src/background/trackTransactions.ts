import { Provider } from "starknet"

import { BackupWallet } from "../shared/backup.model"
import { getProvider } from "../shared/networks"
import {
  TransactionMeta,
  TransactionStatus,
} from "../shared/transactions.model"

interface TransactionStatusWithProvider extends TransactionStatus {
  provider: Provider
}

type FetchedTransactionStatus = Omit<
  TransactionStatus,
  "walletAddress" | "meta"
>

type Listener = (transactions: TransactionStatus[]) => void

export async function getTransactionStatus(
  provider: Provider,
  hash: string,
): Promise<FetchedTransactionStatus> {
  const { tx_status } = await provider.getTransactionStatus(hash)
  return { hash, status: tx_status }
}

export class TransactionTracker {
  private transactions: TransactionStatusWithProvider[] = []
  private listeners: Listener[] = []
  private interval: NodeJS.Timeout

  constructor(listener: Listener, interval: number = 30 * 1000) {
    this.listeners = [listener]
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

      this.listeners.forEach((listener) => {
        listener(this.transactions)
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
    const transactionStatuses = await Promise.all(
      this.transactions.map(async ({ hash, provider, walletAddress, meta }) => {
        return getTransactionStatus(provider, hash).then((status) => ({
          ...status,
          walletAddress,
          provider,
          meta,
        }))
      }),
    )
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
      this.listeners.forEach((listener) => {
        listener(this.transactions)
      })
    }
  }

  public addListener(listener: Listener): void {
    this.listeners.push(listener)
  }

  public removeListener(listener: Listener): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  public async stop(): Promise<void> {
    clearInterval(this.interval)
  }
}
