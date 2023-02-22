import { SwapTransaction } from "../../type"
import { getEntityWithName } from "../getEntityWithName"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** mySwap swap */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (
    result.dapp?.id === "myswap-xyz" &&
    fingerprint === "events[Approval,Transfer,Transfer] calls[approve]"
  ) {
    const { calls, events } = explorerTransaction
    const call = getEntityWithName(calls, "approve")
    if (call) {
      const action = "SWAP"
      const entity = "TOKEN"
      const fromTokenAddress = events[1].address
      const toTokenAddress = events[2].address
      const fromAmount = getParameter(
        events[1].parameters ?? undefined,
        "value",
      )
      const toAmount = getParameter(events[2].parameters ?? undefined, "value")
      result = {
        ...result,
        action,
        entity,
        fromTokenAddress,
        toTokenAddress,
        fromAmount,
        toAmount,
      } as SwapTransaction
      return result
    }
  }
}
