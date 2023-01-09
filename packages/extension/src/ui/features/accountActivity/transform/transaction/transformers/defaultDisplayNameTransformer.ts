import { transactionNamesToTitle } from "../../../../../../shared/transactions"
import { formatTruncatedAddress } from "../../../../../services/addresses"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

/** default displayName from calls */

export default function ({ transaction, result }: ITransactionTransformer) {
  const { meta, hash } = transaction
  const calls = getCallsFromTransaction(transaction)
  const entrypointNames = calls.map(({ entrypoint }) => entrypoint)
  let displayName = meta?.title || formatTruncatedAddress(hash)
  if (entrypointNames.length) {
    const entrypointDisplayName = transactionNamesToTitle(entrypointNames)
    if (entrypointDisplayName) {
      displayName = entrypointDisplayName
    }
  }
  result = {
    ...result,
    displayName,
  }
  return result
}
