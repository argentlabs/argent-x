import {
  isAddMultisigSignersCall,
  isRemoveMultisigSignersCall,
  isReplaceMultisigSignerCall,
} from "../../../../../call/changeMultisigSignersCall"
import { ChangeMultisigSignerTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    let action: string
    let displayName: string

    // Determine the type of call
    if (isAddMultisigSignersCall(call)) {
      action = "ADD"
      displayName = "Add signers"
    } else if (isRemoveMultisigSignersCall(call)) {
      action = "REMOVE"
      displayName = "Remove signers"
    } else if (isReplaceMultisigSignerCall(call)) {
      action = "REPLACE"
      displayName = "Replace signer"
    } else {
      return
    }

    const entity = "SIGNER"

    switch (action) {
      case "ADD":
      case "REMOVE":
      case "REPLACE":
        result = {
          ...result,
          action,
          entity,
          displayName,
        } as ChangeMultisigSignerTransaction
        return result
      default:
        // Handle other cases if needed or simply break
        break
    }
  }
}
