import { SwapTransaction } from "../../type"
import { getEntityWithName } from "../getEntityWithName"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** Jediswap Swap */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (
    result.dapp?.id === "jediswap-xyz" &&
    fingerprint ===
      "events[Approval,Transfer,Sync,Swap] calls[approve,swap_exact_tokens_for_tokens]"
  ) {
    const { calls, events } = explorerTransaction
    const event = getEntityWithName(events, "Swap")
    const call = getEntityWithName(calls, "swap_exact_tokens_for_tokens")
    if (event && call) {
      const path = getParameter(call.parameters, "path")
      if (Array.isArray(path)) {
        const action = "SWAP"
        const entity = "TOKEN"
        const dappContractAddress = call.address
        const fromTokenAddress = path[0]
        const toTokenAddress = path[path.length - 1]
        const fromAmount = getParameter(
          event.parameters ?? undefined,
          "amount1In",
        )
        const toAmount = getParameter(
          event.parameters ?? undefined,
          "amount0Out",
        )
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
}
