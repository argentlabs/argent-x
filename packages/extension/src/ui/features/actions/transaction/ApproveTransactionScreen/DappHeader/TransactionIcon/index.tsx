import { FC } from "react"

import {
  ApiTransactionReviewResponse,
  ApiTransactionReviewTargettedDapp,
  getTransactionReviewSwap,
  getTransactionReviewWithType,
} from "../../../../../../../shared/transactionReview.service"
import { useCurrentNetwork } from "../../../../../networks/hooks/useCurrentNetwork"
import { ApproveScreenType } from "../../../types"
import { useERC721Transfers } from "../../../useErc721Transfers"
import { AggregatedSimData } from "../../../useTransactionSimulatedData"
import { ActivateAccountIcon } from "./ActivateAccountIcon"
import { ActivateMultisigIcon } from "./ActivateMultisigIcon"
import { AddArgentShieldIcon } from "./AddArgentShieldIcon"
import { AddOwnerIcon } from "./AddOwnerIcon"
import { DeclareContractIcon } from "./DeclareTransactionIcon"
import { NftTransactionIcon } from "./NftTransactionIcon"
import { RemoveArgentShieldIcon } from "./RemoveArgentShieldIcon"
import { RemoveOwnerIcon } from "./RemoveOwnerIcon"
import { SendTransactionIcon } from "./SendTransactionIcon"
import { SwapTransactionIcon } from "./SwapTransactionIcon"
import { UnknownDappIcon } from "./UnknownDappIcon"
import { UpdateThresholdIcon } from "./UpdateThresholdIcon"
import { VerifiedDappIcon } from "./VerifiedDappIcon"

export interface TransactionIconProps {
  transactionReview?: ApiTransactionReviewResponse
  aggregatedData?: AggregatedSimData[]
  verifiedDapp?: ApiTransactionReviewTargettedDapp
  approveScreenType: ApproveScreenType
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transactionReview,
  aggregatedData,
  approveScreenType,
  verifiedDapp,
}) => {
  const network = useCurrentNetwork()

  const nftTransfers = useERC721Transfers(aggregatedData)
  const swapTxnReview = getTransactionReviewSwap(transactionReview)
  const transactionReviewWithType =
    getTransactionReviewWithType(transactionReview)

  // Check approve screen type and return appropriate icon
  switch (approveScreenType) {
    case ApproveScreenType.DECLARE:
      return <DeclareContractIcon />
    case ApproveScreenType.DEPLOY:
      return <DeclareContractIcon />
    case ApproveScreenType.ACCOUNT_DEPLOY:
      return <ActivateAccountIcon />
    case ApproveScreenType.MULTISIG_DEPLOY:
      return <ActivateMultisigIcon />
    case ApproveScreenType.MULTISIG_ADD_SIGNERS:
      return <AddOwnerIcon />
    case ApproveScreenType.MULTISIG_REMOVE_SIGNER:
      return <RemoveOwnerIcon />
    case ApproveScreenType.MULTISIG_UPDATE_THRESHOLD:
      return <UpdateThresholdIcon />
    case ApproveScreenType.ADD_ARGENT_SHIELD:
      return <AddArgentShieldIcon />
    case ApproveScreenType.REMOVE_ARGENT_SHIELD:
      return <RemoveArgentShieldIcon />
    default:
      // Check if swap transaction review is available
      if (swapTxnReview) {
        return (
          <SwapTransactionIcon network={network} transaction={swapTxnReview} />
        )
      }

      // Check if transaction is a transfer

      // Here the assumption is that if the transaction is a transfer, it is a send transaction
      // and that it will be done in-app without approval
      // If there is approval, this will not render
      if (transactionReviewWithType?.type === "transfer") {
        return (
          <SendTransactionIcon
            network={network}
            transaction={transactionReviewWithType}
          />
        )
      }

      // Check for verified Dapp
      if (verifiedDapp) {
        return <VerifiedDappIcon iconUrl={verifiedDapp.logoUrl} />
      }

      // Check for NFT transfers
      if (nftTransfers?.length) {
        return (
          <NftTransactionIcon network={network} nftTransfers={nftTransfers} />
        )
      }

      // If none of the above conditions are true, return unknown Dapp icon
      return <UnknownDappIcon />
  }
}
