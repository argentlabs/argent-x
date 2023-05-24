import {
  isAddMultisigSignersCall,
  isRemoveMultisigSignersCall,
} from "../../../../../../shared/call/changeMultisigSignersCall"
import { ChangeMultisigSignerTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isAddMultisigSignersCall(call) || isRemoveMultisigSignersCall(call)) {
      const action = isAddMultisigSignersCall(call) ? "ADD" : "REMOVE"
      const entity = "SIGNER"
      const displayName = isAddMultisigSignersCall(call)
        ? "Add multisig owner"
        : "Remove multisig owner"
      result = {
        ...result,
        action,
        entity,
        displayName,
      } as ChangeMultisigSignerTransaction
      return result
    }
  }
}
