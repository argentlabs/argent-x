import { BigNumberish, Call } from "starknet"

import { TransactionAction } from "@argent/x-shared"
import { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"
import { UseDisclosureReturn } from "@chakra-ui/react"
import { ApiTransactionReviewTargettedDapp } from "../../../../../shared/transactionReview.service"
import { WalletAccount } from "../../../../../shared/wallet.model"
import { Multisig } from "../../../multisig/Multisig"
import { MultisigConfirmationsBannerProps } from "../MultisigConfirmationsBanner"
import { ApproveScreenType, TransactionActionsType } from "../types"
import { AggregatedSimData } from "../useTransactionSimulatedData"
import { ConfirmScreenProps } from "./ConfirmScreen"

export interface ApproveTransactionScreenContainerProps
  extends Omit<ConfirmScreenProps, "onSubmit"> {
  actionHash: string
  actionIsApproving?: boolean
  actionErrorApproving?: string
  onSubmit: (transactionAction: TransactionAction) => void
  approveScreenType: ApproveScreenType
  declareOrDeployType?: "declare" | "deploy"
  selectedAccount: WalletAccount
  transactionAction: TransactionAction
  onRejectWithoutClose?: () => void
  multisigBannerProps?: MultisigConfirmationsBannerProps
  transactionContext?: "STANDARD_EXECUTE" | "MULTISIG_ADD_SIGNATURE"
  onConfirmAnyway?: (transactionAction: TransactionAction) => void
  ledgerActionModalDisclosure?: UseDisclosureReturn
  ledgerErrorMessage?: string
  disableLedgerApproval?: boolean
  isRejectOnChain?: boolean
  isUpgradeAccount?: boolean
  txNeedsRetry?: boolean
  nonce?: BigNumberish
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
  hasBalanceChange: boolean
  showTransactionActions: boolean
  showTxDetails: boolean
  setShowTxDetails: (viewMoreDetails: boolean) => void
}
