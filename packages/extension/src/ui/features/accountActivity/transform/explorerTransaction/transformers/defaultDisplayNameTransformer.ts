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
  let names: string[] = ["Contract interaction"]
  if (callNames?.length) {
    names = callNames
  } else if (eventNames?.length) {
    names = eventNames
  }
  const displayName = transactionNamesToTitle(names)
  result = {
    ...result,
    displayName,
  }
  return result
}
