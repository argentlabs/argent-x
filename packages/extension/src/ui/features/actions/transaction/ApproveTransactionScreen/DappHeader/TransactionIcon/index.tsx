import { useERC721Transactions } from "@argent/x-shared"
import { FC } from "react"

import {
  ApiTransactionReviewTargettedDapp,
  transactionReviewHasSwap,
  transactionReviewHasTransfer,
} from "../../../../../../../shared/transactionReview.service"
import { useCurrentNetwork } from "../../../../../networks/hooks/useCurrentNetwork"
import { ApproveScreenType } from "../../../types"
import { AggregatedSimData } from "@argent/x-shared"
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
import { ReplaceOwnerIcon } from "./ReplaceOwnerIcon"
import { ReviewOfTransaction } from "../../../../../../../shared/transactionReview/schema"

export interface TransactionIconProps {
  transactionReview?: ReviewOfTransaction
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

  const nftTransfers = useERC721Transactions(aggregatedData)
  const isSwap = transactionReviewHasSwap(transactionReview)
  const isTransfer = transactionReviewHasTransfer(transactionReview)

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
    case ApproveScreenType.MULTISIG_REMOVE_SIGNERS:
      return <RemoveOwnerIcon />
    case ApproveScreenType.MULTISIG_REPLACE_SIGNER:
      return <ReplaceOwnerIcon />
    case ApproveScreenType.MULTISIG_UPDATE_THRESHOLD:
      return <UpdateThresholdIcon />
    case ApproveScreenType.ADD_ARGENT_SHIELD:
      return <AddArgentShieldIcon />
    case ApproveScreenType.REMOVE_ARGENT_SHIELD:
      return <RemoveArgentShieldIcon />
    default:
      // Check if swap transaction review is available
      if (isSwap) {
        return (
          <SwapTransactionIcon
            network={network}
            aggregatedData={aggregatedData}
          />
        )
      }

      // Check if transaction is a transfer

      // Here the assumption is that if the transaction is a transfer, it is a send transaction
      // and that it will be done in-app without approval
      // If there is approval, this will not render
      if (isTransfer) {
        return (
          <SendTransactionIcon
            network={network}
            aggregatedData={aggregatedData}
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
