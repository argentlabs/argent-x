import { TextWithAmount } from "@argent/ui"
import { BigNumber } from "ethers"
import { FC, useEffect, useMemo } from "react"

import { EstimateFeeResponse } from "../../../../shared/messages/TransactionMessage"
import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { Token } from "../../../../shared/token/type"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { TransactionsFeeEstimationProps } from "./types"
import { FeeEstimationBox } from "./ui/FeeEstimationBox"
import { FeeEstimationText } from "./ui/FeeEstimationText"
import { InsufficientFundsAccordion } from "./ui/InsufficientFundsAccordion"
import { TransactionFailureAccordion } from "./ui/TransactionFailureAccordion"
import { getTooltipText, useMaxFeeEstimation } from "./utils"
import { getParsedError } from "./utils"

export const FeeEstimationContainer: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  networkId,
  onErrorChange,
  transactions,
  actionHash,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const { feeTokenBalance } = useFeeTokenBalance(account)
  const { fee, error } = useMaxFeeEstimation(transactions, actionHash)

  const enoughBalance = useMemo(
    () =>
      Boolean(
        fee?.suggestedMaxFee && feeTokenBalance?.gte(fee.suggestedMaxFee),
      ),
    [feeTokenBalance, fee?.suggestedMaxFee],
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
    fee?.suggestedMaxFee,
  )

  return (
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
    />
  )
}

export interface FeeEstimationProps {
  amountCurrencyValue?: string
  fee?: EstimateFeeResponse
  feeToken: Token
  feeTokenBalance?: BigNumber
  parsedFeeEstimationError: string | false
  showError: boolean
  showEstimateError: boolean
  showFeeError: boolean
  suggestedMaxFeeCurrencyValue?: string
}

export const FeeEstimation: FC<FeeEstimationProps> = ({
  amountCurrencyValue,
  fee,
  feeToken,
  feeTokenBalance,
  parsedFeeEstimationError,
  showError,
  showFeeError,
  suggestedMaxFeeCurrencyValue,
}) => {
  const tooltipText = useMemo(() => {
    if (fee) {
      return getTooltipText(fee.suggestedMaxFee, feeTokenBalance)
    }
  }, [fee, feeTokenBalance])
  const primaryText = useMemo(() => {
    if (fee) {
      return amountCurrencyValue !== undefined ? (
        `≈ ${prettifyCurrencyValue(amountCurrencyValue)}`
      ) : (
        <TextWithAmount amount={fee.amount} decimals={feeToken.decimals}>
          <>
            ≈{" "}
            {feeToken ? (
              prettifyTokenAmount({
                amount: fee.amount,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{fee.amount} Unknown</>
            )}
          </>
        </TextWithAmount>
      )
    }
  }, [amountCurrencyValue, fee, feeToken])
  const secondaryText = useMemo(() => {
    if (fee) {
      if (suggestedMaxFeeCurrencyValue !== undefined) {
        return `(Max ${prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)})`
      }
      return (
        <TextWithAmount
          amount={fee.suggestedMaxFee}
          decimals={feeToken.decimals}
        >
          <>
            (Max&nbsp;
            {feeToken ? (
              prettifyTokenAmount({
                amount: fee.suggestedMaxFee,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{fee.suggestedMaxFee} Unknown</>
            )}
            )
          </>
        </TextWithAmount>
      )
    }
  }, [fee, feeToken, suggestedMaxFeeCurrencyValue])
  const isLoading = !fee || !feeTokenBalance
  if (!showError) {
    return (
      <FeeEstimationBox>
        <FeeEstimationText
          tooltipText={tooltipText}
          primaryText={primaryText}
          secondaryText={secondaryText}
          isLoading={isLoading}
        />
      </FeeEstimationBox>
    )
  }
  if (showFeeError) {
    return (
      <InsufficientFundsAccordion
        tooltipText={tooltipText}
        primaryText={primaryText}
        secondaryText={secondaryText}
      />
    )
  }
  return (
    <TransactionFailureAccordion
      parsedFeeEstimationError={parsedFeeEstimationError}
    />
  )
}
