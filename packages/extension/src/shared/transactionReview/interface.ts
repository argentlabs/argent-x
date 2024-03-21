import { z } from "zod"

import { EnrichedSimulateAndReview } from "./schema"
import { Address, callSchema, hexSchema } from "@argent/x-shared"

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

export interface ITransactionReviewService {
  simulateAndReview({
    transactions,
    feeTokenAddress,
  }: {
    transactions: TransactionReviewTransactions[]
    feeTokenAddress: Address
  }): Promise<EnrichedSimulateAndReview>
  getLabels(): Promise<ITransactionReviewLabel[] | undefined>
}

export type ITransactionReviewLabel = {
  key: string
  value: string
}

export type ITransactionReviewLabelsStore = {
  labels?: ITransactionReviewLabel[]
  updatedAt?: number
}
