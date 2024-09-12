export interface ITransactionReviewWorker {
  maybeUpdateLabels(): Promise<void>
  maybeUpdateWarnings(): Promise<void>
}
