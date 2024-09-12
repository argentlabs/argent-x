import { Address } from "@argent/x-shared"
import {
  ITransactionReviewService,
  TransactionReviewTransactions,
} from "../../../shared/transactionReview/interface"
import { messageClient } from "../trpc"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { BigNumberish, Call } from "starknet"
import { EstimatedFees } from "@argent/x-shared/simulation"

export class ClientTransactionReviewService
  implements ITransactionReviewService
{
  constructor(private readonly trpcClient: typeof messageClient) {}

  async simulateAndReview({
    transactions,
    feeTokenAddress,
    appDomain,
  }: {
    transactions: TransactionReviewTransactions[]
    feeTokenAddress: Address
    appDomain?: string
  }) {
    return this.trpcClient.transactionReview.simulateAndReview.query({
      transactions,
      feeTokenAddress,
      appDomain,
    })
  }

  async getTransactionHash(
    account: BaseWalletAccount,
    transactions: Call | Call[],
    estimatedFees?: EstimatedFees,
    nonce?: BigNumberish,
  ) {
    return this.trpcClient.transactionReview.getTransactionHash.query({
      account,
      transactions,
      estimatedFees,
      nonce,
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
