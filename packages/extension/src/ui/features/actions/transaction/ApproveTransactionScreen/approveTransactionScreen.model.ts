import type { BigNumberish, Call } from "starknet"

import type { TransactionAction } from "@argent/x-shared"
import type { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"
import type { UseDisclosureReturn } from "@chakra-ui/react"
import type { ApiTransactionReviewTargettedDapp } from "../../../../../shared/transactionReview.service"
import type { WalletAccount } from "../../../../../shared/wallet.model"
import type { Multisig } from "../../../multisig/Multisig"
import type { MultisigConfirmationsBannerProps } from "../MultisigConfirmationsBanner"
import type { ApproveScreenType } from "../types"
import type { ConfirmScreenProps } from "./ConfirmScreen"

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
  isMainnet: boolean
  transactionReview?: EnrichedSimulateAndReview
  selectedAccount: WalletAccount
  disableConfirm: boolean
  verifiedDapp?: ApiTransactionReviewTargettedDapp
  hasPendingMultisigTransactions: boolean
  multisig?: Multisig
  confirmButtonText?: string
  transactions: Call[]
  showTxDetails: boolean
  setShowTxDetails: (viewMoreDetails: boolean) => void
}
