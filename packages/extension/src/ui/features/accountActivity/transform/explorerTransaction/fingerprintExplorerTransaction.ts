/**
 * Derives a simple fingerprint from the event and call names in an Explorer transaction
 *
 * This is used to match known transaction types in the transformer
 */

import {
  IExplorerTransaction,
  IExplorerTransactionEvent,
} from "../../../../../shared/explorer/type"
import { isEqualAddress } from "../../../../services/addresses"
import { getParameter } from "./getParameter"

const GOERLI_SEQUENCER_ADDRESS =
  "0x46a89ae102987331d369645031b49c27738ed096f2789c24449966da4c6de6b"

/** Identify sequencer fee transfer events so they can be excluded {@link https://github.com/eqlabs/pathfinder/issues/569} */

export const isEthTransferToSequencer = (event: IExplorerTransactionEvent) => {
  if (event.name === "Transfer") {
    const toAddress = getParameter(event.parameters, "to")
    if (toAddress && isEqualAddress(toAddress, GOERLI_SEQUENCER_ADDRESS)) {
      return true
    }
  }
  return false
}

export const fingerprintExplorerTransaction = (
  explorerTransaction: IExplorerTransaction,
) => {
  const events = explorerTransaction.events
    ?.filter((event) => !isEthTransferToSequencer(event))
    .map((event) => event.name)
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
