import { BaseTransaction } from "../../../shared/transactions/interface"

type TxStatusUpdate<H extends BaseTransaction, S> = {
  transaction: H
  status: S
}

// TransactionTrackingService used to track inflight transactions
export interface TransactionTrackingService<H extends BaseTransaction, S> {
  add: (transaction: H) => Promise<void>
  get: (transaction: H) => Promise<S>
  subscribe: (
    callback: (ctx: TxStatusUpdate<H, S>) => void,
  ) => Promise<() => void>
}

export abstract class BaseTransactionTrackingService<
  T extends BaseTransaction,
  S,
> implements TransactionTrackingService<T, S>
{
  protected callbacks = new Set<(ctx: TxStatusUpdate<T, S>) => void>()
  protected identifierToStatuses = new Map<string, S>()

  constructor(
    protected defaultStatus: S,
    protected toIdentifier: (tx: T) => string,
  ) {}

  protected notifySubscribers(transaction: T, status: S) {
    this.callbacks.forEach((callback) => {
      callback({ transaction, status })
    })
  }

  async add(transaction: T): Promise<void> {
    const identifier = this.toIdentifier(transaction)
    this.identifierToStatuses.set(identifier, this.defaultStatus)
    this.notifySubscribers(transaction, this.defaultStatus)
  }
  async get(transaction: T): Promise<S> {
    const identifier = this.toIdentifier(transaction)
    const status = this.identifierToStatuses.get(identifier)

    if (!status) {
      throw new Error(`Transaction ${transaction} not tracked`)
    }
    return status
  }
  async subscribe(
    callback: (ctx: TxStatusUpdate<T, S>) => void,
  ): Promise<() => void> {
    this.callbacks.add(callback)
    return () => {
      this.callbacks.delete(callback)
    }
  }
}
