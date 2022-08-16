import { IExplorerTransaction } from "../../../../shared/explorer/type"

/**
 * Derives a simple fingerprint from the event and call names in an Explorer transaction
 *
 * This is used to match known transaction types in the transformer
 */

export const fingerprintExplorerTransaction = (
  explorerTransaction: IExplorerTransaction,
) => {
  const events = explorerTransaction.events
    ?.map((event) => event.name)
    .filter((name) => name !== "transaction_executed")
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
