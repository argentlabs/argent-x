import { NFTTransaction } from "../../type"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** adds erc721 mint transfer data */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (fingerprint === "events[Transfer] calls[mint]") {
    const { calls, events } = explorerTransaction
    const action = "MINT"
    const entity = "NFT"
    const displayName = "Mint NFT"
    const contractAddress = calls?.[0]?.address
    const parameters = events[0].parameters
    const tokenId =
      getParameter(parameters, "value") || getParameter(parameters, "tokenId")
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
