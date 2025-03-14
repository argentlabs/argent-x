import { isFunction } from "lodash-es"
import type { FC } from "react"
import { useEffect, useMemo } from "react"
import type { TokenWithBalance } from "@argent/x-shared"
import { estimatedFeesToMaxFeeTotalV2 } from "@argent/x-shared"
import { useWalletAccount } from "../../accounts/accounts.state"
import { FeeEstimation } from "../feeEstimation/FeeEstimation"
import { getParsedFeeError } from "../feeEstimation/feeError"
import type { EstimatedFeesV2 } from "@argent/x-shared/simulation"
import type { AccountId } from "../../../../shared/wallet.model"

export interface FeeEstimationContainerProps {
  onChange?: (fee: bigint) => void
  onErrorChange?: (error: boolean) => void
  onFeeErrorChange?: (error: boolean) => void
  accountId: AccountId
  transactionSimulationLoading?: boolean
  transactionSimulationFeeError?: Error
  needsDeploy?: boolean
  error?: any
  fee?: EstimatedFeesV2
  feeToken?: TokenWithBalance
  onOpenFeeTokenPicker?: () => void
  allowFeeTokenSelection?: boolean
  isSendingMoreThanBalanceAndGas?: boolean
  isSubsidised?: boolean
}

export const FeeEstimationContainer: FC<FeeEstimationContainerProps> = ({
  accountId,
  onErrorChange,
  onFeeErrorChange,
  needsDeploy = false,
  error,
  fee,
  feeToken,
  onOpenFeeTokenPicker,
  allowFeeTokenSelection = true,
  isSendingMoreThanBalanceAndGas,
  isSubsidised,
}) => {
  const account = useWalletAccount(accountId)
  if (!account) {
    throw new Error("Account not found")
  }

  const enoughBalance = useMemo(() => {
    if (isSubsidised) {
      return true // If the transaction is subsidised, we don't need to check the balance
    }
    if (!feeToken || !fee) {
      return false
    }
    return feeToken.balance >= estimatedFeesToMaxFeeTotalV2(fee)
  }, [feeToken, fee, isSubsidised])

  const showInsufficientFeeError = useMemo(() => {
    if (isSubsidised || !fee || typeof feeToken?.balance !== "bigint") {
      return false
    }
    return !enoughBalance || Boolean(isSendingMoreThanBalanceAndGas)
  }, [
    enoughBalance,
    fee,
    feeToken?.balance,
    isSendingMoreThanBalanceAndGas,
    isSubsidised,
  ])

  const showEstimateError = Boolean(error)
  const showError = showInsufficientFeeError || showEstimateError

  const hasError = !fee || !enoughBalance || showError

  useEffect(() => {
    onErrorChange?.(hasError)
  }, [hasError, onErrorChange])

  useEffect(() => {
    if (isFunction(onFeeErrorChange)) {
      onFeeErrorChange(showInsufficientFeeError)
    }
  }, [showInsufficientFeeError, onFeeErrorChange])

  const parsedFeeEstimationError = useMemo(() => {
    if (showEstimateError && error) {
      return getParsedFeeError(error)
    }
    return undefined
  }, [error, showEstimateError])

  if (!feeToken) {
    return null
  }

  return (
    <FeeEstimation
      fee={fee}
      feeToken={feeToken}
      parsedFeeEstimationError={parsedFeeEstimationError}
      showError={showError}
      showEstimateError={showEstimateError}
      showInsufficientFeeError={showInsufficientFeeError}
      needsDeploy={needsDeploy}
      onOpenFeeTokenPicker={onOpenFeeTokenPicker}
      allowFeeTokenSelection={allowFeeTokenSelection}
      isSubsidised={isSubsidised}
    />
  )
}
