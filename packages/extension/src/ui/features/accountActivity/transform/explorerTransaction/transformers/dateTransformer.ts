import { IExplorerTransactionTransformer } from "./type"

/** date from timestamp */

export default function ({
  explorerTransaction,
  result,
}: IExplorerTransactionTransformer) {
  const { timestamp } = explorerTransaction
  if (timestamp) {
    result = {
      ...result,
      date: new Date(timestamp * 1000).toISOString(),
    }
  }
  return result
}
