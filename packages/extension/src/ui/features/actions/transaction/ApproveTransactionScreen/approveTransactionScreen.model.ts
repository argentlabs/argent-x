import { UseDisclosureReturn } from "@chakra-ui/react"
import React from "react"
import { Call } from "starknet"

import {
  ApiTransactionReviewResponse,
  ApiTransactionReviewTargettedDapp,
} from "../../../../../shared/transactionReview.service"
import { ApiTransactionBulkSimulationResponse } from "../../../../../shared/transactionSimulation/types"
import { WalletAccount } from "../../../../../shared/wallet.model"
import { Multisig } from "../../../multisig/Multisig"
import { ApproveScreenType, TransactionActionsType } from "../types"
import { AggregatedSimData } from "../useTransactionSimulatedData"
import { ConfirmScreenProps } from "./ConfirmScreen"
import { MultisigBannerProps } from "./MultisigBanner"
import { TransactionAction } from "@argent/shared"

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
  transactionReview?: ApiTransactionReviewResponse
  transactionSimulation?: ApiTransactionBulkSimulationResponse
  selectedAccount: WalletAccount
  disableConfirm: boolean
  verifiedDapp?: ApiTransactionReviewTargettedDapp
  hasPendingMultisigTransactions: boolean
  multisig?: Multisig
  confirmButtonText?: string
  transactions: Call[]
  multisigModalDisclosure: UseDisclosureReturn
  showFraudMonitorBanner: boolean
  hasBalanceChange: boolean
  showTransactionActions: boolean
  transactionActionsType?: TransactionActionsType
  assessmentReason: React.ReactNode
  showTxDetails: boolean
  setShowTxDetails: (viewMoreDetails: boolean) => void
  multisigBannerProps: MultisigBannerProps
}
