import { NFTTransaction } from "../../type"
import { getEntityWithName } from "../getEntityWithName"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** adds Influence NFT purchase */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (
    result.dapp?.id === "influenceth-io" &&
    fingerprint === "events[Approval,Transfer,Transfer] calls[approve]"
  ) {
    const { calls, events } = explorerTransaction
    const call = getEntityWithName(calls, "approve")
    if (call) {
      const action = "BUY"
      const entity = "NFT"
      const displayName = "Buy NFT"
      const dappContractAddress = getParameter(call.parameters, "spender")
      const contractAddress = events[2].address
      const tokenId = getParameter(events[2].parameters ?? undefined, "value")
      result = {
        ...result,
        action,
        entity,
        displayName,
        dappContractAddress,
        contractAddress,
        tokenId,
      } as NFTTransaction
      return result
    }
  }
}
