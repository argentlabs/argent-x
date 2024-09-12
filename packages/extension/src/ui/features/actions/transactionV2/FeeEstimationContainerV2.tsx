import { isFunction } from "lodash-es"
import { FC, useEffect, useMemo } from "react"
import {
  TokenWithBalance,
  estimatedFeesToTotal,
  estimatedFeesToMaxFeeTotal,
} from "@argent/x-shared"
import { useWalletAccount } from "../../accounts/accounts.state"
import {
  useCurrencyDisplayEnabled,
  useTokenAmountToCurrencyValue,
} from "../../accountTokens/tokenPriceHooks"
import { FeeEstimation } from "../feeEstimation/FeeEstimation"
import { ParsedFeeError, getParsedFeeError } from "../feeEstimation/feeError"
import { EstimatedFees } from "@argent/x-shared/simulation"

export interface FeeEstimationContainerV2Props {
  onChange?: (fee: bigint) => void
  onErrorChange?: (error: boolean) => void
  onFeeErrorChange?: (error: boolean) => void
  accountAddress: string
  networkId: string
  transactionSimulationLoading: boolean
  transactionSimulationFeeError?: Error
  needsDeploy?: boolean
  error?: any
  fee?: EstimatedFees
  feeToken?: TokenWithBalance
  onOpenFeeTokenPicker?: () => void
  allowFeeTokenSelection?: boolean
  isSendingMoreThanBalanceAndGas?: boolean
}

export const FeeEstimationContainerV2: FC<FeeEstimationContainerV2Props> = ({
  accountAddress,
  networkId,
  onErrorChange,
  onFeeErrorChange,
  transactionSimulationFeeError,
  needsDeploy = false,
  error,
  fee,
  feeToken,
  onOpenFeeTokenPicker,
  allowFeeTokenSelection = true,
  isSendingMoreThanBalanceAndGas,
}) => {
  const account = useWalletAccount({ address: accountAddress, networkId })
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
  const showEstimateError =
    Boolean(error) || Boolean(transactionSimulationFeeError)
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
    if (transactionSimulationFeeError) {
      parsedFeeEstimationError = getParsedFeeError(
        transactionSimulationFeeError,
      )
    } else if (error) {
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
