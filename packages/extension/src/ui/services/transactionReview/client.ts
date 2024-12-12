import type { Address, TransactionAction } from "@argent/x-shared"
import type { ITransactionReviewService } from "../../../shared/transactionReview/interface"
import type { messageClient } from "../trpc"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import type { Call } from "starknet"
import type { EstimatedFees } from "@argent/x-shared/simulation"
import type { AccountDeployTransaction } from "../../../shared/transactionReview/transactionAction.model"

export class ClientTransactionReviewService
  implements ITransactionReviewService
{
  constructor(private readonly trpcClient: typeof messageClient) {}

  async simulateAndReview({
    transaction,
    feeTokenAddress,
    accountDeployTransaction,
    appDomain,
    maxSendEstimate,
  }: {
    transaction: TransactionAction
    accountDeployTransaction?: AccountDeployTransaction
    feeTokenAddress: Address
    appDomain?: string
    maxSendEstimate?: boolean
  }) {
    return this.trpcClient.transactionReview.simulateAndReview.query({
      transaction,
      accountDeployTransaction,
      feeTokenAddress,
      appDomain,
      maxSendEstimate,
    })
  }

  async getCompressedTransactionPayload(
    account: BaseWalletAccount,
    transactions: Call | Call[],
    estimatedFees?: EstimatedFees,
    nonce?: string,
  ) {
    return this.trpcClient.transactionReview.getCompressedTransactionPayload.query(
      {
        account,
        transactions,
        estimatedFees,
        nonce,
      },
    )
  }

  async getLabels() {
    return this.trpcClient.transactionReview.getLabels.query()
  }

  async getWarnings() {
    return this.trpcClient.transactionReview.getWarnings.query()
  }
}
