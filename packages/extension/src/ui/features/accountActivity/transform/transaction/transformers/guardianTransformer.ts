import { constants, num, CallData } from "starknet"

import { isChangeGuardianCall } from "../../../../../../shared/call/changeGuardianCall"
import { ChangeGuardianTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isChangeGuardianCall(call)) {
      const guardianAddressCalldata = CallData.toCalldata(call.calldata)[0]
      if (guardianAddressCalldata !== undefined) {
        const guardianAddress = num.toBigInt(guardianAddressCalldata)
        const isRemove = guardianAddress === constants.ZERO
        const action = isRemove ? "REMOVE" : "ADD"
        const entity = "GUARDIAN"
        const displayName = isRemove
          ? "Deactivate Argent Shield"
          : "Activate Argent Shield"
        result = {
          ...result,
          action,
          entity,
          displayName,
        } as ChangeGuardianTransaction
        return result
      }
    }
  }
}
