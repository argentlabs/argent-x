import {
  ActivitySummary,
  activitySummarySchema,
} from "@argent/x-shared/simulation"
import {
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "../is"
import { TransformedTransaction } from "./../type"
import { addressSchema } from "@argent/x-shared"

/**
 * This tries to build an activity summary from a transformed transaction
 * should be used to obtain the activity meta
 * for now this is limited to tokens. Cannot be used for NFTs as there not enough information in the transformed transaction
 */
export const buildBasicActivitySummary = (
  transformedTransaction?: TransformedTransaction,
): ActivitySummary[] => {
  if (!transformedTransaction) {
    return []
  }
  const isTokenTransfer = isTokenTransferTransaction(transformedTransaction)
  const isTokenApprove = isTokenApproveTransaction(transformedTransaction)
  const isTokenMint = isTokenMintTransaction(transformedTransaction)
  const isSwap = isSwapTransaction(transformedTransaction)

  const sent =
    transformedTransaction.action === "SEND" ||
    transformedTransaction.action === "TRANSFER"
  if (isTokenTransfer || isTokenApprove || isTokenMint) {
    const normalized: ActivitySummary = {
      asset: {
        type: "token",
        tokenAddress:
          addressSchema.safeParse(transformedTransaction.tokenAddress).data ||
          "0x0", // this should not happen, fallback to prevent a client crash
        amount: transformedTransaction.amount,
      },
      sent,
    }
    return [activitySummarySchema.parse(normalized)]
  } else if (isSwap) {
    const sent: ActivitySummary = {
      asset: {
        type: "token",
        tokenAddress: transformedTransaction.toToken.address,
        amount: transformedTransaction.toAmount,
      },
      sent: true,
    }
    const received: ActivitySummary = {
      asset: {
        type: "token",
        tokenAddress: transformedTransaction.fromToken.address,
        amount: transformedTransaction.fromAmount,
      },
      sent: true,
    }
    return [
      activitySummarySchema.parse(sent),
      activitySummarySchema.parse(received),
    ]
  }

  return []
}
