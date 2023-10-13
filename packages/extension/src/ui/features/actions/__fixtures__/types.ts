import { ApproveTransactionScreenProps } from "../transaction/ApproveTransactionScreen/approveTransactionScreen.model"

export type TransactionActionFixture = Pick<
  ApproveTransactionScreenProps,
  | "actionHash"
  | "aggregatedData"
  | "transactionReview"
  | "transactions"
  | "transactionSimulation"
  | "verifiedDapp"
  | "transactionActionsType"
>
