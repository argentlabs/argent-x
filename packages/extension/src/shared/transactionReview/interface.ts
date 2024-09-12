import { z } from "zod"

import {
  EnrichedSimulateAndReview,
  EstimatedFees,
} from "@argent/x-shared/simulation"
import {
  Address,
  Hex,
  ITransactionReviewBase,
  ITransactionReviewLabel,
  ITransactionReviewWarning,
  callSchema,
  hexSchema,
} from "@argent/x-shared"
import { BaseWalletAccount } from "../wallet.model"
import { BigNumberish, Call } from "starknet"

export const transactionReviewTransactionsSchema = z.object({
  type: z
    .enum(["DECLARE", "DEPLOY", "DEPLOY_ACCOUNT", "INVOKE"])
    .default("INVOKE"),
  calls: z.array(callSchema).or(callSchema).optional(),
  calldata: z.array(z.string()).optional(),
  classHash: hexSchema.optional(),
  salt: hexSchema.optional(),
  signature: z.array(z.string()).optional(),
})

export type TransactionReviewTransactions = z.infer<
  typeof transactionReviewTransactionsSchema
>

export interface ITransactionReviewService extends ITransactionReviewBase {
  simulateAndReview({
    transactions,
    feeTokenAddress,
    appDomain,
  }: {
    transactions: TransactionReviewTransactions[]
    feeTokenAddress: Address
    appDomain?: string
  }): Promise<EnrichedSimulateAndReview>

  getTransactionHash(
    baseAccount: BaseWalletAccount,
    calls: Call | Call[],
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ): Promise<Hex | null>

  getCompressedTransactionPayload(
    baseAccount: BaseWalletAccount,
    calls: Call | Call[],
    estimatedFee?: EstimatedFees,
    providedNonce?: BigNumberish,
  ): Promise<string | null>
}

export type ITransactionReviewLabelsStore = {
  labels?: ITransactionReviewLabel[]
  updatedAt?: number
}

export type ITransactionReviewWarningsStore = {
  warnings?: ITransactionReviewWarning[]
  updatedAt?: number
}
