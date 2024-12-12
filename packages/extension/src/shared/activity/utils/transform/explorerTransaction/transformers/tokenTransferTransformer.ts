import { isEqualAddress } from "@argent/x-shared"
import type { TokenTransferTransaction } from "../../type"
import { getParameter } from "../getParameter"
import type { IExplorerTransactionTransformer } from "./type"

/** adds erc20 token transfer data */

export default function ({
  explorerTransaction,
  accountAddress,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  /** Some transfers have no events */
  if (
    fingerprint === "events[Transfer] calls[transfer]" ||
    fingerprint === "events[] calls[transfer]"
  ) {
    const { calls, events } = explorerTransaction
    if (calls?.length === 1) {
      const entity = "TOKEN"
      let action = "TRANSFER"
      let displayName = "Transfer"
      const tokenAddress = calls[0].address
      const parameters = calls[0].parameters
      const eventParameters = events?.[0]?.parameters
      const fromAddress =
        explorerTransaction.contractAddress ||
        getParameter(eventParameters ?? undefined, "from_")
      const toAddress = getParameter(parameters, "recipient")
      const amount = getParameter(parameters, "amount")
      if (accountAddress && toAddress && fromAddress) {
        if (isEqualAddress(toAddress, accountAddress)) {
          action = "RECEIVE"
          displayName = "Receive"
        }
        if (isEqualAddress(fromAddress, accountAddress)) {
          action = "SEND"
          displayName = "Send"
        }
      }
      result = {
        ...result,
        action,
        entity,
        displayName,
        fromAddress,
        toAddress,
        amount,
        tokenAddress,
      } as TokenTransferTransaction
      return result
    }
  }
}
