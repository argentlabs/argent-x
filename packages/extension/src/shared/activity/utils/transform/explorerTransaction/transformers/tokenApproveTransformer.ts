import type { TokenApproveTransaction } from "../../type"
import { getParameter } from "../getParameter"
import type { IExplorerTransactionTransformer } from "./type"

/** adds erc20 token approve data */

export default function ({
  explorerTransaction,
  fingerprint,
  result,
}: IExplorerTransactionTransformer) {
  if (fingerprint === "events[Approval] calls[approve]") {
    const { calls } = explorerTransaction
    if (calls) {
      const entity = "TOKEN"
      const action = "APPROVE"
      const displayName = "Approve"
      const tokenAddress = calls[0].address
      const parameters = calls[0].parameters
      const spenderAddress = getParameter(parameters, "spender")
      const amount = getParameter(parameters, "amount")
      result = {
        ...result,
        action,
        entity,
        displayName,
        spenderAddress,
        amount,
        tokenAddress,
      } as TokenApproveTransaction
      return result
    }
  }
}
