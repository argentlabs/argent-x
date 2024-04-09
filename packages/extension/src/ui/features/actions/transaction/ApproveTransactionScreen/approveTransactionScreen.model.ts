import { UseDisclosureReturn } from "@chakra-ui/react"
import { Call } from "starknet"

import { TransactionAction } from "@argent/x-shared"
import { ApiTransactionReviewTargettedDapp } from "../../../../../shared/transactionReview.service"
import { EnrichedSimulateAndReview } from "../../../../../shared/transactionReview/schema"
import { WalletAccount } from "../../../../../shared/wallet.model"
import { Multisig } from "../../../multisig/Multisig"
import { ApproveScreenType, TransactionActionsType } from "../types"
import { AggregatedSimData } from "../useTransactionSimulatedData"
import { ConfirmScreenProps } from "./ConfirmScreen"
import { MultisigBannerProps } from "./MultisigBanner"

export interface ApproveTransactionScreenContainerProps
  extends Omit<ConfirmScreenProps, "onSubmit"> {
  actionHash: string
  actionIsApproving?: boolean
  actionErrorApproving?: string
  onSubmit: (transactionAction: TransactionAction) => void
  approveScreenType: ApproveScreenType
  declareOrDeployType?: "declare" | "deploy"
  selectedAccount?: WalletAccount
  transactionAction: TransactionAction
  onRejectWithoutClose?: () => void
  multisigBannerProps?: MultisigBannerProps
  hideFooter?: boolean
  multisigModalDisclosure?: UseDisclosureReturn
  transactionContext?: "STANDARD_EXECUTE" | "MULTISIG_ADD_SIGNATURE"
  onConfirmAnyway?: (transactionAction: TransactionAction) => void
}

export interface ApproveTransactionScreenProps
  extends ApproveTransactionScreenContainerProps,
    Omit<ConfirmScreenProps, "onSubmit"> {
  aggregatedData: AggregatedSimData[]
  isMainnet: boolean
  isSimulationLoading: boolean
  transactionReview?: EnrichedSimulateAndReview
  transactionActionsType?: TransactionActionsType
  selectedAccount: WalletAccount
  disableConfirm: boolean
  verifiedDapp?: ApiTransactionReviewTargettedDapp
  hasPendingMultisigTransactions: boolean
  multisig?: Multisig
  confirmButtonText?: string
  transactions: Call[]
  multisigModalDisclosure: UseDisclosureReturn
  hasBalanceChange: boolean
  showTransactionActions: boolean
  showTxDetails: boolean
  setShowTxDetails: (viewMoreDetails: boolean) => void
  multisigBannerProps: MultisigBannerProps
}
