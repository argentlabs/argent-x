/**
 * Derives a simple fingerprint from the event and call names in an Explorer transaction
 *
 * This is used to match known transaction types in the transformer
 */

import { IExplorerTransaction } from "../../../../../shared/explorer/type"

export const fingerprintExplorerTransaction = (
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
      if (event.name === "transaction_executed") {
        break
      }
      events.push(event.name)
    }
  }
  const calls = explorerTransaction.calls?.map((call) => call.name)
  const elements = []
  if (events !== undefined) {
    elements.push(`events[${events.join(",")}]`)
  }
  if (calls !== undefined) {
    elements.push(`calls[${calls.join(",")}]`)
  }
  if (elements.length) {
    return elements.join(" ")
  }
}
