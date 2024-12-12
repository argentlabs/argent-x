import type { ApproveTransactionScreenProps } from "../transaction/ApproveTransactionScreen/approveTransactionScreen.model"

export type TransactionActionFixture = Pick<
  ApproveTransactionScreenProps,
  "transactionReview" | "transactions"
>
