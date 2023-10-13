import { isFunction, isUndefined } from "lodash-es"
import { FC, useEffect, useMemo } from "react"

import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/useFeeTokenBalance"
import { useAccount } from "../../accounts/accounts.state"
import { useAggregatedTxFeesData } from "../transaction/useTransactionSimulatedData"
import { CombinedFeeEstimation } from "./CombinedFeeEstimation"
import { ParsedFeeError, getParsedFeeError } from "./feeError"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxFeeEstimation } from "./utils"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"

export const CombinedFeeEstimationContainer: FC<
  TransactionsFeeEstimationProps
> = ({
  accountAddress,
  transactions,
  actionHash,
  onErrorChange,
  onFeeErrorChange,
  networkId,
  userClickedAddFunds,
  transactionSimulation,
  transactionSimulationFee,
  transactionSimulationFeeError,
  transactionSimulationLoading,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const { fee: feeSequencer, error } = useMaxFeeEstimation(
    transactions,
    actionHash,
    transactionSimulation,
    transactionSimulationLoading,
  )

  const { fee, totalFee, totalMaxFee } = useAggregatedTxFeesData(
    transactionSimulation,
    transactionSimulationFee,
    feeSequencer,
    true,
  )
  const enoughBalance = useMemo(
    () =>
      Boolean(
        totalMaxFee &&
          feeTokenBalance &&
          feeTokenBalance >= BigInt(totalMaxFee),
      ),
    [feeTokenBalance, totalMaxFee],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError =
    Boolean(error) || Boolean(transactionSimulationFeeError)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
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
  const feeToken = useNetworkFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken ?? undefined,
    fee?.amount,
  )

  const totalMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    totalMaxFee,
  )

  const hasTransactions = !isUndefined(transactions)

  if (!hasTransactions) {
    return null
  }

  return (
    <CombinedFeeEstimation
      amountCurrencyValue={amountCurrencyValue}
      fee={fee}
      feeToken={feeToken}
      feeTokenBalance={feeTokenBalance}
      parsedFeeEstimationError={parsedFeeEstimationError}
      showError={showError}
      showEstimateError={showEstimateError}
      showFeeError={showFeeError}
      totalFee={totalFee}
      totalMaxFee={totalMaxFee}
      userClickedAddFunds={userClickedAddFunds}
      totalMaxFeeCurrencyValue={totalMaxFeeCurrencyValue}
    />
  )
}
