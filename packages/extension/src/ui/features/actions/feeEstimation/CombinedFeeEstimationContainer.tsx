import { isFunction } from "lodash-es"
import { FC, useEffect, useMemo } from "react"

import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useAccount } from "../../accounts/accounts.state"
import { useAggregatedTxFeesData } from "../transaction/useTransactionSimulatedData"
import { CombinedFeeEstimation } from "./CombinedFeeEstimation"
import { ParsedFeeError, getParsedFeeError } from "./feeError"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxFeeEstimation } from "./utils"

export const CombinedFeeEstimationContainer: FC<
  TransactionsFeeEstimationProps
> = ({
  feeToken,
  accountAddress,
  transactionAction,
  actionHash,
  onErrorChange,
  onFeeErrorChange,
  networkId,
  userClickedAddFunds,
  transactionSimulation,
  transactionSimulationFeeError,
  transactionSimulationLoading,
  allowFeeTokenSelection,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const { fee: feeSequencer, error } = useMaxFeeEstimation(
    actionHash,
    account,
    transactionAction,
    feeToken.address,
    transactionSimulation,
    transactionSimulationLoading,
  )

  const { fee, totalFee, totalMaxFee } = useAggregatedTxFeesData(
    transactionSimulation,
    feeSequencer,
  )
  const enoughBalance = useMemo(
    () =>
      Boolean(
        totalMaxFee &&
          feeToken?.balance &&
          feeToken?.balance >= BigInt(totalMaxFee),
      ),
    [feeToken?.balance, totalMaxFee],
  )

  const showFeeError = Boolean(fee && feeToken?.balance && !enoughBalance)
  const showEstimateError =
    Boolean(error) || Boolean(transactionSimulationFeeError)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
    // only rerun when error changes
  }, [hasError]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken ?? undefined,
    totalFee,
  )

  const totalMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    totalMaxFee,
  )

  return (
    <CombinedFeeEstimation
      amountCurrencyValue={amountCurrencyValue}
      fee={fee}
      feeToken={feeToken}
      parsedFeeEstimationError={parsedFeeEstimationError}
      showError={showError}
      showEstimateError={showEstimateError}
      showFeeError={showFeeError}
      totalFee={totalFee}
      totalMaxFee={totalMaxFee}
      userClickedAddFunds={userClickedAddFunds}
      totalMaxFeeCurrencyValue={totalMaxFeeCurrencyValue}
      allowFeeTokenSelection={allowFeeTokenSelection}
    />
  )
}
