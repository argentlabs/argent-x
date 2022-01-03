import { Provider, Status } from "starknet"

interface TransactionStatus {
  hash: string
  status: Status
}
type Listener = (transactions: TransactionStatus[]) => void

export async function getTransactionStatus(
  provider: Provider,
  hash: string,
): Promise<TransactionStatus> {
  const { tx_status } = await provider.getTransactionStatus(hash)
  return { hash, status: tx_status }
}

export class TransactionTracker {
  private transactions: { hash: string; provider: Provider }[] = []
  private transactionStatus: TransactionStatus[] = []
  private listeners: Listener[] = []
  private interval: NodeJS.Timeout

  constructor(listener: Listener, interval: number = 30 * 1000) {
    this.listeners = [listener]
    this.interval = setInterval(() => this.checkTransactions(), interval)
  }

  public async trackTransaction(
    transactionHash: string,
    network: string,
  ): Promise<void> {
    const provider = new Provider({ network: network as any })
    this.transactions.push({ hash: transactionHash, provider })
  }

  public getTransactionStatus(hash: string): TransactionStatus | undefined {
    return this.transactionStatus.find(({ hash: txHash }) => txHash === hash)
  }

  private async checkTransactions(): Promise<void> {
    const transactionStatus = await Promise.all(
      this.transactions.map(async ({ hash, provider }) => {
        return getTransactionStatus(provider, hash)
      }),
    )
    if (transactionStatus.length > 0) {
      this.transactionStatus = transactionStatus
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
