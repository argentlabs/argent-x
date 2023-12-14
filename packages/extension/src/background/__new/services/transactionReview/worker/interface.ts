export interface ITransactionReviewWorker {
  maybeUpdateLabels(): Promise<void>
}
