import { FC, useEffect, useMemo } from "react"

import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { getParsedFeeError } from "./feeError"
import { FeeEstimation } from "./FeeEstimation"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxAccountDeploymentFeeEstimation } from "./utils"
import { useTokenBalance } from "../../accountTokens/tokens.state"
import {
  estimatedFeeToMaxFeeTotal,
  estimatedFeeToTotal,
} from "../../../../shared/transactionSimulation/utils"

type DeployAccountFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
>

export const DeployAccountFeeEstimation: FC<
  DeployAccountFeeEstimationProps
> = ({
  feeTokenAddress,
  accountAddress,
  actionHash,
  onErrorChange,
  networkId,
}) => {
  const account = useAccount({ address: accountAddress, networkId })

  if (!account) {
    throw new Error("Account not found")
  }

  const feeToken = useTokenBalance(feeTokenAddress, account)
  const { fee, error } = useMaxAccountDeploymentFeeEstimation(
    { address: accountAddress, networkId },
    actionHash,
  )

  const deployAccountTotal = useMemo(() => {
    if (!fee) {
      return undefined
    }
    return estimatedFeeToTotal(fee)
  }, [fee])

  const deployAccountMaxFee = useMemo(() => {
    if (!fee) {
      return undefined
    }
    return estimatedFeeToMaxFeeTotal(fee)
  }, [fee])

  const enoughBalance = useMemo(
    () =>
      Boolean(
        deployAccountTotal &&
          feeToken &&
          feeToken.balance >= deployAccountTotal,
      ),
    [deployAccountTotal, feeToken],
  )

  const showFeeError = Boolean(fee && feeToken && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeToken || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
  }, [hasError, onErrorChange])

  const parsedFeeEstimationError = showEstimateError
    ? getParsedFeeError(error)
    : undefined
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    deployAccountTotal,
  )

  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    deployAccountMaxFee,
  )

  return (
    <>
      {feeToken && (
        <FeeEstimation
          amountCurrencyValue={amountCurrencyValue}
          fee={fee ? { transactions: fee } : undefined}
          feeToken={feeToken}
          parsedFeeEstimationError={parsedFeeEstimationError}
          showError={showError}
          showEstimateError={showEstimateError}
          showFeeError={showFeeError}
          suggestedMaxFeeCurrencyValue={suggestedMaxFeeCurrencyValue}
        />
      )}
    </>
  )
}
