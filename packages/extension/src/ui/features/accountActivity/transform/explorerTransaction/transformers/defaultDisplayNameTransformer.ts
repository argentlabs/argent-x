import { transactionNamesToTitle } from "../../../../../../shared/transactions"
import {
  getCallNames,
  getPreExecutionEventNames,
} from "../fingerprintExplorerTransaction"
import { IExplorerTransactionTransformer } from "./type"

/** default displayName from calls or events */

export default function ({
  explorerTransaction,
  result,
}: IExplorerTransactionTransformer) {
  const eventNames = getPreExecutionEventNames(explorerTransaction)
  const callNames = getCallNames(explorerTransaction)

  let displayName = transactionNamesToTitle("Contract interaction") // default state

  if (callNames?.length) {
    displayName = transactionNamesToTitle(callNames) // Check if transforming the call name will actually produce a title
  }
  if (!displayName && eventNames?.length) {
    displayName = transactionNamesToTitle(eventNames)
  }

  result = {
    ...result,
    displayName,
  }
  return result
}
