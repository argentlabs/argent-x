import { ApproveTransactionScreenProps } from "../transaction/ApproveTransactionScreen/approveTransactionScreen.model"

export type TransactionActionFixture = Pick<
  ApproveTransactionScreenProps,
  | "aggregatedData"
  | "transactionReview"
  | "transactions"
  | "transactionActionsType"
>
