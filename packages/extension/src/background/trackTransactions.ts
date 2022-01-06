import { Provider, Status } from "starknet"

import { BackupWallet } from "../shared/backup.model"
import {
  TransactionMeta,
  TransactionStatus,
} from "../shared/transactions.model"

interface TransactionStatusWithProvider extends TransactionStatus {
  provider: Provider
}
type FetchedTransactionStatus = Omit<
  Omit<TransactionStatus, "walletAddress">,
  "meta"
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
    const provider = new Provider({ network: wallet.network as any })
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
    const transactionStatus = await Promise.all(
      this.transactions.map(async ({ hash, provider, walletAddress, meta }) => {
        return getTransactionStatus(provider, hash).then((status) => ({
          ...status,
          walletAddress,
          provider,
          meta,
        }))
      }),
    )
    if (transactionStatus.length > 0) {
      this.transactions = transactionStatus
      this.listeners.forEach((listener) => {
        listener(transactionStatus)
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
