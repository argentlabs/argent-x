import type { TokenMintTransaction } from "../../type"
import { getParameter } from "../getParameter"
import type { IExplorerTransactionTransformer } from "./type"

/** adds erc20 token mint data */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (fingerprint === "events[] calls[mint]") {
    const { calls } = explorerTransaction
    const action = "MINT"
    const entity = "TOKEN"
    const displayName = "Mint"
    const tokenAddress = calls?.[0]?.address
    const parameters = calls?.[0].parameters
    const amount = getParameter(parameters, "tokenId")
    result = {
      ...result,
      action,
      entity,
      displayName,
      amount,
      tokenAddress,
    } as TokenMintTransaction
    return result
  }
}
