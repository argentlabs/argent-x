import { isEqualAddress } from "../../../../../services/addresses"
import { NFTTransferTransaction } from "../../type"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"

/** adds erc721 token transfer data */

export default function ({
  explorerTransaction,
  accountAddress,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (fingerprint === "events[Approve,Transfer] calls[transferFrom]") {
    const { calls } = explorerTransaction
    const entity = "NFT"
    let action = "TRANSFER"
    let displayName = "Transfer NFT"
    const contractAddress = calls?.[0]?.address
    const parameters = calls?.[0]?.parameters
    const fromAddress = getParameter(parameters, "from_")
    const toAddress = getParameter(parameters, "to")
    const tokenId = getParameter(parameters, "tokenId")
    if (accountAddress && toAddress && fromAddress) {
      if (isEqualAddress(toAddress, accountAddress)) {
        action = "RECEIVE"
        displayName = "Receive NFT"
      }
      if (isEqualAddress(fromAddress, accountAddress)) {
        action = "SEND"
        displayName = "Send NFT"
      }
    }
    result = {
      ...result,
      action,
      entity,
      displayName,
      fromAddress,
      toAddress,
      tokenId,
      contractAddress,
    } as NFTTransferTransaction
    return result
  }
}
