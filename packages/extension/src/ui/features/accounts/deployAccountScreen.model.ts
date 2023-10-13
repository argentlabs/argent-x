import { ConfirmPageProps } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"

export type DeployAccountScreenContainerProps = Omit<
  ConfirmPageProps,
  "onSubmit"
>
