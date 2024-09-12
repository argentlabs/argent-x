import {
  TransactionDetail,
  TransactionDetailProps,
} from "@argent-x/extension/src/ui/features/accountActivity/TransactionDetail"
import {
  transformExplorerTransaction,
  transformTransaction,
} from "@argent-x/extension/src/shared/activity/utils/transform"
import { FC } from "react"

interface TransactionDetailWrappedProps
  extends Omit<TransactionDetailProps, "transactionTransformed"> {
  accountAddress: string
}

export const TransactionDetailWrapped: FC<TransactionDetailWrappedProps> = ({
  transaction,
  explorerTransaction,
  accountAddress,
  ...rest
}) => {
  if (transaction) {
    const transactionTransformed = transformTransaction({
      transaction,
      accountAddress,
    })
    if (transactionTransformed) {
      return (
        <TransactionDetail
          transaction={transaction}
          transactionTransformed={transactionTransformed}
          {...rest}
        ></TransactionDetail>
      )
    }
  }
  if (explorerTransaction) {
    const explorerTransactionTransformed = transformExplorerTransaction({
      explorerTransaction,
      accountAddress,
    })
    if (explorerTransactionTransformed) {
      return (
        <TransactionDetail
          explorerTransaction={explorerTransaction}
          transactionTransformed={explorerTransactionTransformed}
          {...rest}
        ></TransactionDetail>
      )
    }
  }
  return null
}
