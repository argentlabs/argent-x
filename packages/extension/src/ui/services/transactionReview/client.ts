import { Address } from "@argent/shared"
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
    feeTokenAddress,
  }: {
    transactions: TransactionReviewTransactions[]
    feeTokenAddress: Address
  }) {
    return this.trpcClient.transactionReview.simulateAndReview.query({
      transactions,
      feeTokenAddress,
    })
  }

  async getLabels() {
    return this.trpcClient.transactionReview.getLabels.query()
  }
}
