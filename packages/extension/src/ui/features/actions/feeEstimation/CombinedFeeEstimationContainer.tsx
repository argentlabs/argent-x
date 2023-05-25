import { FC, useEffect, useMemo } from "react"
import { number } from "starknet"

import { getFeeToken } from "../../../../shared/token/utils"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { CombinedFeeEstimation } from "./CombinedFeeEstimation"
import { TransactionsFeeEstimationProps } from "./types"
import { getParsedError, useMaxFeeEstimation } from "./utils"

export const CombinedFeeEstimationContainer: FC<
  TransactionsFeeEstimationProps
> = ({
  accountAddress,
  transactions,
  actionHash,
  onErrorChange,
  networkId,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const { fee, error } = useMaxFeeEstimation(transactions, actionHash)

  const totalFee = useMemo(() => {
    if (account.needsDeploy && fee?.accountDeploymentFee) {
      return number.toHex(
        number.toBN(fee.accountDeploymentFee).add(number.toBN(fee.amount)),
      )
    }
    return fee?.amount
  }, [account.needsDeploy, fee?.accountDeploymentFee, fee?.amount])

  const totalMaxFee = useMemo(() => {
    if (account.needsDeploy && fee?.maxADFee) {
      return number.toHex(
        number.toBN(fee.maxADFee).add(number.toBN(fee.suggestedMaxFee)),
      )
    }
    return fee?.suggestedMaxFee
  }, [account.needsDeploy, fee?.maxADFee, fee?.suggestedMaxFee])

  const enoughBalance = useMemo(
    () => Boolean(totalMaxFee && feeTokenBalance?.gte(totalMaxFee)),
    [feeTokenBalance, totalMaxFee],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
    // only rerun when error changes
  }, [hasError]) // eslint-disable-line react-hooks/exhaustive-deps

  const parsedFeeEstimationError = showEstimateError && getParsedError(error)
  const feeToken = getFeeToken(networkId)
  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    fee?.amount,
  )

  const totalMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeToken,
    totalMaxFee,
  )

  const hasTransactions = typeof transactions !== undefined

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
      totalMaxFeeCurrencyValue={totalMaxFeeCurrencyValue}
    />
  )
}
