import { FC, useMemo } from "react"

import {
  ApiTransactionReviewResponse,
  ApiTransactionReviewTargettedDapp,
  getTransactionReviewWithType,
} from "../../../../../../../shared/transactionReview.service"
import { useCurrentNetwork } from "../../../../../networks/useNetworks"
import { useERC721Transfers } from "../../../useErc721Transfers"
import { AggregatedSimData } from "../../../useTransactionSimulatedData"
import { DeclareContractIcon } from "./DeclareTransactionIcon"
import { NftTransactionIcon } from "./NftTransactionIcon"
import { SendTransactionIcon } from "./SendTransactionIcon"
import { SwapTransactionIcon } from "./SwapTransactionIcon"
import { UnknownDappIcon } from "./UnknownDappIcon"
import { VerifiedDappIcon } from "./VerifiedDappIcon"

export interface TransactionIconProps {
  transactionReview?: ApiTransactionReviewResponse
  aggregatedData?: AggregatedSimData[]
  isDeclareContract: boolean
  verifiedDapp?: ApiTransactionReviewTargettedDapp
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transactionReview,
  aggregatedData,
  isDeclareContract,
  verifiedDapp,
}) => {
  const network = useCurrentNetwork()

  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )
  const nftTransfers = useERC721Transfers(aggregatedData)
  if (isDeclareContract) {
    return <DeclareContractIcon />
  }
  if (transactionReviewWithType?.type === "swap") {
    return (
      <SwapTransactionIcon
        network={network}
        transaction={transactionReviewWithType}
      />
    )
  }

  if (transactionReviewWithType?.type === "transfer") {
    return (
      <SendTransactionIcon
        network={network}
        transaction={transactionReviewWithType}
      />
    )
  }

  if (verifiedDapp) {
    return <VerifiedDappIcon iconUrl={verifiedDapp.iconUrl} />
  }

  if (nftTransfers?.length) {
    return <NftTransactionIcon network={network} nftTransfers={nftTransfers} />
  }

  return <UnknownDappIcon />
}
