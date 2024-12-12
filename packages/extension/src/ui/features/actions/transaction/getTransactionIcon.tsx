import type { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"
import type { IconKeys } from "@argent/x-ui"
import {
  getReviewOfTransaction,
  transactionReviewHasNft,
  transactionReviewHasSwap,
  transactionReviewHasTransfer,
} from "../../../../shared/transactionReview.service"
import { ApproveScreenType } from "./types"

export const getTransactionIcon = (
  approveScreenType?: ApproveScreenType,
  transactionReview?: EnrichedSimulateAndReview,
): IconKeys => {
  const reviewOfTransaction = getReviewOfTransaction(transactionReview)

  const isNft = transactionReviewHasNft(reviewOfTransaction)
  const isSwap = transactionReviewHasSwap(reviewOfTransaction)
  const isTransfer = transactionReviewHasTransfer(reviewOfTransaction)

  // Check approve screen type and return appropriate icon key
  switch (approveScreenType) {
    case ApproveScreenType.DECLARE:
    case ApproveScreenType.DEPLOY:
      return "DocumentIcon"
    case ApproveScreenType.ACCOUNT_DEPLOY:
      return "RocketSecondaryIcon"
    case ApproveScreenType.MULTISIG_DEPLOY:
      return "MultisigSecondaryIcon"
    case ApproveScreenType.MULTISIG_ADD_SIGNERS:
      return "AddContactSecondaryIcon"
    case ApproveScreenType.MULTISIG_REMOVE_SIGNERS:
      return "RemoveContactSecondaryIcon"
    case ApproveScreenType.MULTISIG_REPLACE_SIGNER:
      return "MultisigReplaceIcon"
    case ApproveScreenType.MULTISIG_UPDATE_THRESHOLD:
      return "ApproveIcon"
    case ApproveScreenType.ADD_GUARDIAN:
      return "ShieldSecondaryIcon"
    case ApproveScreenType.REMOVE_GUARDIAN:
      return "NoShieldSecondaryIcon"
    case ApproveScreenType.MULTISIG_ON_CHAIN_REJECT:
      return "CrossSecondaryIcon"
  }

  // Check for specific transaction types
  if (isSwap) {
    return "SwapPrimaryIcon"
  }

  if (isTransfer) {
    return "SendSecondaryIcon"
  }

  // Check for NFT transfers
  if (isNft) {
    return "NftIcon"
  }

  // If none of the above conditions are true, return unknown Dapp icon key
  return "NetworkSecondaryIcon"
}
