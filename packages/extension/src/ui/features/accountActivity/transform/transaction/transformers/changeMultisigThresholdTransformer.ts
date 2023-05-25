import { isChangeTresholdMultisigCall } from "../../../../../../shared/call/setMultisigThresholdCalls"
import { ChangeMultisigThresholdTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isChangeTresholdMultisigCall(call)) {
      const action = "CHANGE"
      const entity = "THRESHOLD"
      const displayName = "Set confirmations"
      result = {
        ...result,
        action,
        entity,
        displayName,
      } as ChangeMultisigThresholdTransaction
      return result
    }
  }
}
