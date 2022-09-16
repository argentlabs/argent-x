import { isErc20MintCall } from "../../../../../../shared/call"
import { parseErc20Call } from "../../../../../../shared/call/erc20Call"
import { TokenMintTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

/** adds erc20 token mint data */

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isErc20MintCall(call)) {
      const action = "MINT"
      const entity = "TOKEN"
      const { contractAddress, recipientAddress, amount } = parseErc20Call(call)
      result = {
        ...result,
        action,
        entity,
        toAddress: recipientAddress,
        amount,
        tokenAddress: contractAddress,
      } as TokenMintTransaction
      return result
    }
  }
}
