import { CallData } from "starknet"

import { isChangeGuardianCall } from "../../../../../call/changeGuardianCall"
import type { ChangeGuardianTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import type { ITransactionTransformer } from "./type"
import {
  ChangeGuardian,
  changeGuardianCalldataToType,
} from "../../../../../smartAccount/changeGuardianCallDataToType"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isChangeGuardianCall(call)) {
      const changeGuardianType = changeGuardianCalldataToType(
        CallData.toCalldata(call.calldata),
      )
      if (changeGuardianType !== ChangeGuardian.NONE) {
        const isRemove = changeGuardianType === ChangeGuardian.REMOVING
        const action = isRemove ? "REMOVE" : "ADD"
        const entity = "GUARDIAN"
        const displayName = isRemove ? "Remove Guardian" : "Add Guardian"
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
