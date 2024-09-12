import {
  extractNewClassHash,
  isUpgradeAccountCall,
} from "../../../../../call/upgradeAccountCall"
import { UpgradeAccountTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isUpgradeAccountCall(call)) {
      const action = "UPGRADE"
      const entity = "CONTRACT"
      const displayName = "Upgrade account"
      const newClassHash = extractNewClassHash(call)
      result = {
        ...result,
        action,
        entity,
        displayName,
        newClassHash,
      } as UpgradeAccountTransaction
      return result
    }
  }
}
