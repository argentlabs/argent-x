import { FC, useEffect, useMemo } from "react"

import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { useFeeTokenBalance } from "../../accountTokens/useFeeTokenBalance"
import { getParsedFeeError } from "./feeError"
import { FeeEstimation } from "./FeeEstimation"
import { TransactionsFeeEstimationProps } from "./types"
import { useMaxAccountDeploymentFeeEstimation } from "./utils"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"

type DeployAccountFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
>

export const DeployAccountFeeEstimation: FC<
  DeployAccountFeeEstimationProps
> = ({ accountAddress, actionHash, onErrorChange, networkId }) => {
  const account = useAccount({ address: accountAddress, networkId })

  if (!account) {
    throw new Error("Account not found")
  }

  const { feeTokenBalance } = useFeeTokenBalance(account)
  const { fee, error } = useMaxAccountDeploymentFeeEstimation(
    { address: accountAddress, networkId },
    actionHash,
  )

  const deployAccountFeeToEstimateFeeResponse: EstimatedFees | undefined =
    useMemo(() => {
      if (!fee) {
        return undefined
      }

      return {
        suggestedMaxFee: fee.maxADFee,
        amount: fee.amount,
      }
    }, [fee])

  const enoughBalance = useMemo(
    () =>
      Boolean(
        deployAccountFeeToEstimateFeeResponse?.suggestedMaxFee &&
          feeTokenBalance &&
          feeTokenBalance >=
            BigInt(deployAccountFeeToEstimateFeeResponse.suggestedMaxFee),
      ),
    [feeTokenBalance, deployAccountFeeToEstimateFeeResponse],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
  }, [hasError, onErrorChange])

  const parsedFeeEstimationError = showEstimateError
    ? getParsedFeeError(error)
    : undefined
  const feeToken = useNetworkFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    fee?.amount,
  )

  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken || undefined,
    deployAccountFeeToEstimateFeeResponse?.suggestedMaxFee,
  )

  return (
    <>
      {feeToken && (
        <FeeEstimation
          amountCurrencyValue={amountCurrencyValue}
          fee={deployAccountFeeToEstimateFeeResponse}
          feeToken={feeToken}
          feeTokenBalance={feeTokenBalance}
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
