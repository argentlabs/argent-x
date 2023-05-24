import { FC, useEffect, useMemo } from "react"

import { EstimateFeeResponse } from "../../../../shared/messages/TransactionMessage"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { FeeEstimation } from "./FeeEstimation"
import { DeployAccountFeeEstimationProps } from "./types"
import { getParsedError, useMaxAccountDeploymentFeeEstimation } from "./utils"

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

  const deployAccountFeeToEstimateFeeResponse: EstimateFeeResponse | undefined =
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
          feeTokenBalance?.gte(
            deployAccountFeeToEstimateFeeResponse.suggestedMaxFee,
          ),
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

  const parsedFeeEstimationError = showEstimateError && getParsedError(error)
  const feeToken = useNetworkFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )

  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    deployAccountFeeToEstimateFeeResponse?.suggestedMaxFee,
  )

  return (
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
  )
}
