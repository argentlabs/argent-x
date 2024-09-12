import { SwapTransaction } from "../../type"
import { getEntityWithName } from "../getEntityWithName"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** adds Alpha Road Swap data */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (
    result.dapp?.id === "alpharoad-fi" &&
    fingerprint ===
      "events[Approval,Transfer,Transfer,Swap] calls[approve,swapExactTokensForTokens]"
  ) {
    const { events, calls } = explorerTransaction
    const event = getEntityWithName(events, "Swap")
    const call = getEntityWithName(calls, "swapExactTokensForTokens")
    if (event && call && event.parameters) {
      const action = "SWAP"
      const entity = "TOKEN"
      const parameters = event.parameters
      const dappContractAddress = call.address
      const fromTokenAddress = getParameter(parameters, "token_from_address")
      const toTokenAddress = getParameter(parameters, "token_to_address")
      const fromAmount = getParameter(parameters, "amount_from")
      const toAmount = getParameter(parameters, "amount_to")
      result = {
        ...result,
        action,
        entity,
        dappContractAddress,
        fromTokenAddress,
        toTokenAddress,
        fromAmount,
        toAmount,
      } as SwapTransaction
      return result
    }
  }
}
