import { isChangeTresholdMultisigCall } from "../../../../../call/setMultisigThresholdCalls"
import { ChangeMultisigThresholdTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isChangeTresholdMultisigCall(call)) {
      const action = "CHANGE"
      const entity = "THRESHOLD"
      const displayName = "Change threshold"
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
