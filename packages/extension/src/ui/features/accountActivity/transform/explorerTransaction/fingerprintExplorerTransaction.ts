/**
 * Derives a simple fingerprint from the event and call names in an Explorer transaction
 *
 * This is used to match known transaction types in the transformer
 */
import { IExplorerTransaction } from "../../../../../shared/explorer/type"

export const getPreExecutionEventNames = (
  explorerTransaction: IExplorerTransaction,
) => {
  /**
   * Create an array of event names up to but excluding `transaction_executed`
   *
   * There may or may not be an additional `Transfer` fee event to the sequencer after this
   *
   * {@link https://github.com/eqlabs/pathfinder/issues/569}
   */
  let events: string[] | undefined
  if (Array.isArray(explorerTransaction.events)) {
    events = []
    for (const event of explorerTransaction.events) {
      if (
        !event.name ||
        event.name === "transaction_executed" ||
        event.name === "TransactionExecuted"
      ) {
        break
      }
      events.push(event.name)
    }
    return events
  }
}

export const getCallNames = (explorerTransaction: IExplorerTransaction) => {
  const calls = explorerTransaction.calls?.map((call) => call.name)
  return calls
}

export const fingerprintExplorerTransaction = (
  explorerTransaction: IExplorerTransaction,
) => {
  const eventNames = getPreExecutionEventNames(explorerTransaction)
  const callNames = getCallNames(explorerTransaction)
  const elements = []
  if (eventNames !== undefined) {
    elements.push(`events[${eventNames.join(",")}]`)
  }
  if (callNames !== undefined) {
    elements.push(`calls[${callNames.join(",")}]`)
  }
  if (elements.length) {
    return elements.join(" ")
  }
}
