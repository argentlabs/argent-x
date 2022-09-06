import { isEqualAddress } from "../../../../../services/addresses"
import { TokenTransferTransaction } from "../../type"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** adds erc20 token transfer data */

export default function ({
  explorerTransaction,
  accountAddress,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (fingerprint === "events[Transfer] calls[transfer]") {
    const { events } = explorerTransaction
    const entity = "TOKEN"
    let action = "TRANSFER"
    let displayName = "Transfer"
    const tokenAddress = events[0].address
    const parameters = events[0].parameters
    const fromAddress = getParameter(parameters, "from_")
    const toAddress = getParameter(parameters, "to")
    const amount = getParameter(parameters, "value")
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
