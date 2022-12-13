import { isUdcDeclareCall } from "../../../../../../shared/call/udcDeclareCall"
import { DeclareContractTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  const { meta } = transaction
  for (const call of calls) {
    if (isUdcDeclareCall(call)) {
      const action = "DECLARE"
      const entity = "CONTRACT"
      const displayName = "Contract declared"
      result = {
        ...result,
        action,
        entity,
        displayName,
        classHash: meta?.subTitle,
      } as DeclareContractTransaction
      return result
    }
  }
}
