import { isFunction } from "lodash-es"
import type { FC } from "react"
import { useEffect, useMemo } from "react"
import type { TokenWithBalance } from "@argent/x-shared"
import {
  estimatedFeesToTotal,
  estimatedFeesToMaxFeeTotal,
} from "@argent/x-shared"
import { useWalletAccount } from "../../accounts/accounts.state"
import {
  useCurrencyDisplayEnabled,
  useTokenAmountToCurrencyValue,
} from "../../accountTokens/tokenPriceHooks"
import { FeeEstimation } from "../feeEstimation/FeeEstimation"
import type { ParsedFeeError } from "../feeEstimation/feeError"
import { getParsedFeeError } from "../feeEstimation/feeError"
import type { EstimatedFees } from "@argent/x-shared/simulation"
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
  fee?: EstimatedFees
  feeToken?: TokenWithBalance
  onOpenFeeTokenPicker?: () => void
  allowFeeTokenSelection?: boolean
  isSendingMoreThanBalanceAndGas?: boolean
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
}) => {
  const account = useWalletAccount(accountId)
  if (!account) {
    throw new Error("Account not found")
  }

  const enoughBalance = useMemo(() => {
    if (!feeToken || !fee) {
      return false
    }
    return feeToken.balance >= estimatedFeesToMaxFeeTotal(fee)
  }, [feeToken, fee])

  const showFeeError = Boolean(
    fee &&
      typeof feeToken?.balance === "bigint" &&
      (!enoughBalance || isSendingMoreThanBalanceAndGas),
  )
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
  }, [hasError, onErrorChange])

  useEffect(() => {
    if (!isFunction(onFeeErrorChange)) {
      return
    }
    onFeeErrorChange(showFeeError)
  }, [showFeeError, onFeeErrorChange])

  let parsedFeeEstimationError: ParsedFeeError | undefined
  if (showEstimateError) {
    if (error) {
      parsedFeeEstimationError = getParsedFeeError(error)
    }
  }

  const showCurrencyValue = useCurrencyDisplayEnabled()

  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    showCurrencyValue && feeToken ? feeToken : undefined,
    fee && estimatedFeesToTotal(fee),
  ) // will return undefined if no feeToken or showCurrencyValue is false

  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    showCurrencyValue && feeToken ? feeToken : undefined,
    fee && estimatedFeesToMaxFeeTotal(fee),
  )

  return (
    <>
      {feeToken && (
        <FeeEstimation
          amountCurrencyValue={amountCurrencyValue}
          fee={fee}
          feeToken={feeToken}
          parsedFeeEstimationError={parsedFeeEstimationError}
          showError={showError}
          showEstimateError={showEstimateError}
          showFeeError={showFeeError}
          suggestedMaxFeeCurrencyValue={suggestedMaxFeeCurrencyValue}
          needsDeploy={needsDeploy}
          onOpenFeeTokenPicker={onOpenFeeTokenPicker}
          allowFeeTokenSelection={allowFeeTokenSelection}
        />
      )}
    </>
  )
}
