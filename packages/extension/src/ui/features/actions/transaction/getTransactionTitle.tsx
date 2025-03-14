import { pluralise, prettifyTokenAmount } from "@argent/x-shared"

import type {
  EnrichedSimulateAndReview,
  EnrichedSimulateAndReviewV2,
  Property,
} from "@argent/x-shared/simulation"
import {
  getReviewOfTransaction,
  getTransactionActionByType,
  getTransactionReviewSwapToken,
  transactionReviewHasNft,
  transactionReviewHasSwap,
  transactionReviewHasTransfer,
} from "../../../../shared/transactionReview.service"
import { ApproveScreenType } from "./types"

export const getTransactionTitle = (
  approveScreenType: ApproveScreenType,
  transactionReview?: Pick<EnrichedSimulateAndReviewV2, "transactions">,
  fallback: string = "transaction",
): string => {
  const reviewOfTransaction = getReviewOfTransaction(transactionReview)
  const isSwap = transactionReviewHasSwap(reviewOfTransaction)
  const isTransfer = transactionReviewHasTransfer(reviewOfTransaction)
  const isNft = transactionReviewHasNft(reviewOfTransaction)

  // Check for specific approve screen types
  switch (approveScreenType) {
    case ApproveScreenType.DECLARE:
      return "Declare contract"
    case ApproveScreenType.DEPLOY:
      return "Deploy contract"
    case ApproveScreenType.ACCOUNT_DEPLOY:
      return "Activate account"
    case ApproveScreenType.MULTISIG_DEPLOY:
      return "Activate multisig"
    case ApproveScreenType.MULTISIG_ADD_SIGNERS:
      return "Add multisig owner"
    case ApproveScreenType.MULTISIG_REMOVE_SIGNERS:
      return "Remove owner and set confirmations"
    case ApproveScreenType.MULTISIG_REPLACE_SIGNER:
      return "Replace multisig owner"
    case ApproveScreenType.MULTISIG_UPDATE_THRESHOLD:
      return "Set confirmations"
    case ApproveScreenType.ADD_GUARDIAN:
      return "Add Guardian"
    case ApproveScreenType.REMOVE_GUARDIAN:
      return "Remove Guardian"
  }

  // Check for specific transaction types
  if (isSwap) {
    const srcSymbol = getTransactionReviewSwapToken(
      transactionReview,
      true,
    )?.symbol
    const dstSymbol = getTransactionReviewSwapToken(
      transactionReview,
      false,
    )?.symbol
    if (srcSymbol && dstSymbol) {
      return `Swap ${srcSymbol} to ${dstSymbol}`
    }
    return `Swap`
  }

  if (isTransfer) {
    const action = getTransactionActionByType(
      "ERC20_transfer",
      reviewOfTransaction,
    )
    if (action) {
      const amountProperty = [
        ...action.properties,
        ...(action.defaultProperties || []),
      ].find((p) => p.type === "amount")

      if (amountProperty) {
        const property = amountProperty as Extract<Property, { type: "amount" }>
        const amount = property.amount
        const decimals = property.token.decimals
        const symbol = property.token.symbol

        if (amount && decimals) {
          return `Send ${prettifyTokenAmount({ amount, decimals })} ${symbol}`
        }
      }
    }
  }

  // Display NFT transfers if applicable
  if (isNft) {
    const transfers =
      transactionReview?.transactions?.[0]?.simulation?.transfers
    if (transfers && transfers.length > 0) {
      return `Transfer ${pluralise(transfers.length, "nft")}`
    }
  }

  // Default to fallback text if nothing else matched
  return `Confirm ${fallback}`
}
