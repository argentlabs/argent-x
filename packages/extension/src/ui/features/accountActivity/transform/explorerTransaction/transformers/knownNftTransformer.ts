import { isEqualAddress, includesAddress } from "@argent/x-shared"

import { NFTTransferTransaction } from "../../type"
import { IExplorerTransactionTransformer } from "./type"

/** adds erc721 token transfer data */

// TODO: support if multiple nft transfers are in one transaction
export default function ({
  explorerTransaction,
  accountAddress,
  result,
  nftContractAddresses,
}: IExplorerTransactionTransformer) {
  if (!nftContractAddresses) {
    return
  }
  let enrichedResult: NFTTransferTransaction | undefined = undefined
  const { events } = explorerTransaction
  for (const event of events) {
    if (
      event.name === "Transfer" &&
      includesAddress(event.address, nftContractAddresses) &&
      event.parameters
    ) {
      const contractAddress = event.address
      let displayName = "Transfer NFT"
      const entity = "NFT"
      let action = "TRANSFER"
      const fromAddress = event.parameters[0].value
      const toAddress = event.parameters[1].value
      const tokenId = event.parameters[2].value

      if (accountAddress && toAddress && fromAddress) {
        if (isEqualAddress(toAddress, accountAddress)) {
          action = "RECEIVE"
          displayName = "Receive NFT"
          if (fromAddress === "0x0") {
            action = "MINT"
            displayName = "Mint NFT"
          }
        }
        if (isEqualAddress(fromAddress, accountAddress)) {
          action = "SEND"
          displayName = "Send NFT"
        }
      }
      if (
        // overwrite previous result if it was a nft transfer, as it can only get more specific
        !enrichedResult ||
        (enrichedResult.action === "TRANSFER" &&
          enrichedResult.entity === "NFT")
      ) {
        enrichedResult = {
          ...result,
          action,
          entity,
          displayName,
          fromAddress,
          toAddress,
          tokenId,
          contractAddress,
        } as NFTTransferTransaction
      }
    }
  }
  return enrichedResult
}
