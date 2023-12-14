import { isFunction } from "lodash-es"
import { FC, useEffect, useMemo } from "react"

import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { useFeeTokenBalance } from "../../accountTokens/useFeeTokenBalance"
import { FeeEstimation } from "../feeEstimation/FeeEstimation"
import { ParsedFeeError, getParsedFeeError } from "../feeEstimation/feeError"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
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
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const enoughBalance = useMemo(
    () =>
      Boolean(
        feeTokenBalance && feeTokenBalance >= BigInt(fee.suggestedMaxFee),
      ),
    [feeTokenBalance, fee.suggestedMaxFee],
  )

  const showFeeError = Boolean(
    fee && typeof feeTokenBalance === "bigint" && !enoughBalance,
  )
  const showEstimateError =
    Boolean(error) || Boolean(transactionSimulationFeeError)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
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
  const feeToken = useNetworkFeeToken(networkId)

  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    fee?.amount,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    fee.suggestedMaxFee,
  )

  return (
    <>
      {feeToken && (
        <FeeEstimation
          amountCurrencyValue={amountCurrencyValue}
          fee={fee}
          feeToken={feeToken}
          feeTokenBalance={feeTokenBalance}
          parsedFeeEstimationError={parsedFeeEstimationError}
          showError={showError}
          showEstimateError={showEstimateError}
          showFeeError={showFeeError}
          suggestedMaxFeeCurrencyValue={suggestedMaxFeeCurrencyValue}
          needsDeploy={needsDeploy}
        />
      )}
    </>
  )
}
