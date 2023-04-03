import { NFTTransaction } from "../../type"
import { getEntityWithName } from "../getEntityWithName"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** Aspect buy NFT */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (
    result.dapp?.id === "aspect-co" &&
    fingerprint ===
      "events[Approval,Approval,Transfer,Transfer,Transfer] calls[approve]"
  ) {
    const { calls, events } = explorerTransaction
    const call = getEntityWithName(calls, "approve")
    if (call) {
      const action = "BUY"
      const entity = "NFT"
      const displayName = "Buy NFT"
      const contractAddress = events[2].address
      const tokenId = getParameter(events[2].parameters ?? undefined, "value")
      result = {
        ...result,
        action,
        entity,
        displayName,
        contractAddress,
        tokenId,
      } as NFTTransaction

      return result
    }
  }
}
