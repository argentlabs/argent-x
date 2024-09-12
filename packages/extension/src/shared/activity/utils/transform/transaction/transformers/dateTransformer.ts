import { ITransactionTransformer } from "./type"

/** date from timestamp */

export default function ({ transaction, result }: ITransactionTransformer) {
  const { timestamp } = transaction
  if (timestamp) {
    result = {
      ...result,
      date: new Date(timestamp * 1000).toISOString(),
    }
  }
  return result
}
