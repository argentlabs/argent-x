import { isAddMultisigSignersCall } from "../../../../../../shared/call/addMultisigSignersCall"
import { AddMultisigSignerTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isAddMultisigSignersCall(call)) {
      const action = "ADD"
      const entity = "SIGNER"
      const displayName = "Add multisig owner"
      result = {
        ...result,
        action,
        entity,
        displayName,
      } as AddMultisigSignerTransaction
      return result
    }
  }
}
