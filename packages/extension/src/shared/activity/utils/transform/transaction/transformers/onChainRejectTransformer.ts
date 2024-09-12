import { isRejectOnChainCall } from "../../../../../call/rejectOnChainCall"
import { RejectOnChainTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({
  transaction,
  result,
  accountAddress,
}: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (accountAddress && isRejectOnChainCall(call, accountAddress)) {
      const action = "REJECT_ON_CHAIN"
      const entity = "TOKEN"
      const displayName = "On-chain rejection"
      result = {
        ...result,
        action,
        entity,
        displayName,
      } as RejectOnChainTransaction
      return result
    }
  }
}
