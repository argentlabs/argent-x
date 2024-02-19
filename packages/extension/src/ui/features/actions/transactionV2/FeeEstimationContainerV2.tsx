import { isFunction } from "lodash-es"
import { FC, useEffect, useMemo } from "react"
import { TokenWithBalance } from "@argent/shared"
import { useAccount } from "../../accounts/accounts.state"
import {
  useCurrencyDisplayEnabled,
  useTokenAmountToCurrencyValue,
} from "../../accountTokens/tokenPriceHooks"
import { FeeEstimation } from "../feeEstimation/FeeEstimation"
import { ParsedFeeError, getParsedFeeError } from "../feeEstimation/feeError"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import {
  estimatedFeesToMaxFeeTotal,
  estimatedFeesToTotal,
} from "../../../../shared/transactionSimulation/utils"

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
  fee: EstimatedFees
  feeToken: TokenWithBalance
  onOpenFeeTokenPicker?: () => void
  allowFeeTokenSelection?: boolean
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
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const enoughBalance = useMemo(
    () => feeToken.balance >= estimatedFeesToMaxFeeTotal(fee),
    [feeToken?.balance, fee],
  )

  const showFeeError = Boolean(
    fee && typeof feeToken?.balance === "bigint" && !enoughBalance,
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
    estimatedFeesToTotal(fee),
  ) // will return undefined if no feeToken or showCurrencyValue is false

  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    showCurrencyValue && feeToken ? feeToken : undefined,
    estimatedFeesToMaxFeeTotal(fee),
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
