import { transactionNamesToTitle } from "../../../../../../shared/transactions"
import { IExplorerTransactionTransformer } from "./type"

/** default displayName from calls */

export default function ({
  explorerTransaction,
  result,
}: IExplorerTransactionTransformer) {
  const { calls } = explorerTransaction
  const callNames = calls?.map(({ name }) => name)
  const displayName = callNames?.length
    ? transactionNamesToTitle(callNames)
    : "Unknown"
  result = {
    ...result,
    displayName,
  }
  return result
}
