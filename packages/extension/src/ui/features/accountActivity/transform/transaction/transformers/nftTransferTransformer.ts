import {
  isErc721SafeTransferCall,
  parseErc721SafeTransferCall,
} from "../../../../../../shared/call/erc721TransferCall"
import { NFTTransferTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

/** adds erc721 token transfer data */

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isErc721SafeTransferCall(call)) {
      const action = "TRANSFER"
      const entity = "NFT"
      const displayName = "Transfer NFT"
      const { contractAddress, fromAddress, toAddress, tokenId } =
        parseErc721SafeTransferCall(call)
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
}
