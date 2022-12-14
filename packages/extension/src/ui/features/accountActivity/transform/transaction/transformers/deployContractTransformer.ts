import { isUdcDeployCall } from "../../../../../../shared/call/udcDeployCall"
import { DeployContractTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  const { meta } = transaction
  for (const call of calls) {
    if (isUdcDeployCall(call)) {
      const action = "DEPLOY"
      const entity = "CONTRACT"
      const displayName = "Contract deployed"
      result = {
        ...result,
        action,
        entity,
        displayName,
        contractAddress: meta?.subTitle,
      } as DeployContractTransaction
      return result
    }
  }
}
