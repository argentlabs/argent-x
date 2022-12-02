import { isUdcDeployCall } from "../../../../../../shared/call/udcDeploy"
import { DeployContractTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

/** adds erc721 token transfer data */

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  const { meta } = transaction
  for (const call of calls) {
    if (isUdcDeployCall(call)) {
      const action = "DEPLOY"
      const entity = "CONTRACT"
      const displayName = "Contract deployment"
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
