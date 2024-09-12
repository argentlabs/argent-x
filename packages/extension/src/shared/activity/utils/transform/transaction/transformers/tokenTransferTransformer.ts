import { isErc20TransferCall } from "../../../../../call"
import { parseErc20Call } from "../../../../../call/erc20Call"
import { TokenTransferTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

/** adds erc20 token transfer data */

export default function ({
  transaction,
  result,
  accountAddress,
}: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isErc20TransferCall(call)) {
      const action = "TRANSFER"
      const entity = "TOKEN"
      const displayName = "Send"
      const { contractAddress, recipientAddress, amount } = parseErc20Call(call)
      result = {
        ...result,
        action,
        entity,
        fromAddress: accountAddress,
        toAddress: recipientAddress,
        amount,
        tokenAddress: contractAddress,
        displayName,
      } as TokenTransferTransaction
      return result
    }
  }
}
