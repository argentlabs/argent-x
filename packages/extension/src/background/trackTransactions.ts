import { Provider, Status } from "starknet"

type Listener = (transactions: { hash: string; status: Status }[]) => void

export async function getTransactionStatus(
  provider: Provider,
  hash: string,
): Promise<{ hash: string; status: Status }> {
  const { tx_status } = await provider.getTransactionStatus(hash)
  return { hash, status: tx_status }
}

export class TransactionTracker {
  private transactions: { hash: string; provider: Provider }[] = []
  private transactionStatus: { hash: string; status: Status }[] = []
  private listeners: Listener[] = []
  private interval: NodeJS.Timeout

  constructor(listeners: Listener, interval: number = 30 * 1000) {
    this.listeners = [listeners]
    this.interval = setInterval(() => this.checkTransactions(), interval)
  }

  public async trackTransaction(
    transactionHash: string,
    network: string,
  ): Promise<void> {
    const provider = new Provider({ network: network as any })
    this.transactions.push({ hash: transactionHash, provider })
  }

  public getTransactionStatus(
    hash: string,
  ): { hash: string; status: Status } | undefined {
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
