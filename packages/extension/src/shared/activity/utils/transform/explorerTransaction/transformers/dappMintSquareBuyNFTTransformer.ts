import { NFTTransaction } from "../../type"
import { getEntityWithName } from "../getEntityWithName"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** Mint Square buy NFT */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (
    result.dapp?.id === "mintsquare-io" &&
    fingerprint ===
      "events[Transfer,Transfer,Approval,Transfer,TakerBid] calls[matchAskWithTakerBid]"
  ) {
    const { calls, events } = explorerTransaction
    const call = getEntityWithName(calls, "matchAskWithTakerBid")
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
