import { constants, number } from "starknet"

import { isChangeGuardianCall } from "../../../../../../shared/call/changeGuardianCall"
import { ChangeGuardianTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isChangeGuardianCall(call)) {
      const guardianAddressCalldata = call.calldata?.[0]
      if (guardianAddressCalldata !== undefined) {
        const guardianAddress = number.toBN(guardianAddressCalldata)
        const isRemove = guardianAddress.eq(constants.ZERO)
        const action = isRemove ? "REMOVE" : "ADD"
        const entity = "GUARDIAN"
        const displayName = isRemove
          ? "Remove Argent Shield"
          : "Add Argent Shield"
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
