import {
  ITransactionReviewService,
  TransactionReviewTransactions,
} from "../../../shared/transactionReview/interface"
import { messageClient } from "../messaging/trpc"

export class ClientTransactionReviewService
  implements ITransactionReviewService
{
  constructor(private readonly trpcClient: typeof messageClient) {}

  async simulateAndReview({
    transactions,
  }: {
    transactions: TransactionReviewTransactions[]
  }) {
    return this.trpcClient.transactionReview.simulateAndReview.query(
      transactions,
    )
  }

  async getLabels() {
    return this.trpcClient.transactionReview.getLabels.query()
  }
}
