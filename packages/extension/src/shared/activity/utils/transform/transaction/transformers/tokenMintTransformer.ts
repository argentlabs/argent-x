import { isErc20MintCall } from "../../../../../call"
import { parseErc20Call } from "../../../../../call/erc20Call"
import type { TokenMintTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import type { ITransactionTransformer } from "./type"

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
