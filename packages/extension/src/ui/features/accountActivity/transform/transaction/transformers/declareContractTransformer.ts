import { formatTruncatedAddress } from "../../../../../../../e2e/utils"
import { transactionNamesToTitle } from "../../../../../../shared/transactions"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"

/** adds erc20 token transfer data */

export default function ({ transaction, result }: ITransactionTransformer) {
  const { meta, hash } = transaction
  const calls = getCallsFromTransaction(transaction)
  const entrypointNames = calls.map(({ entrypoint }) => entrypoint)
  let displayName = meta?.title || formatTruncatedAddress(hash)
  const classHash = formatTruncatedAddress(meta?.subTitle || "")
  if (entrypointNames.length) {
    const entrypointDisplayName = transactionNamesToTitle(entrypointNames)
    if (entrypointDisplayName) {
      displayName = entrypointDisplayName
    }
  }
  result = {
    ...result,
    entity: "CONTRACT",
    action: "DECLARE",
    displayName,
    classHash,
  }
  return result
  /* 
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isErc20TransferCall(call)) {
      const action = "TRANSFER"
      const entity = "TOKEN"
      const { contractAddress, recipientAddress, amount } = parseErc20Call(call)
      result = {
        ...result,
        action,
        entity,
        fromAddress: accountAddress,
        toAddress: recipientAddress,
        amount,
        tokenAddress: contractAddress,
      } as TokenTransferTransaction
      return result
    }
  } */
}
