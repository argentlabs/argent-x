import { TextWithAmount } from "@argent/ui"
import { BigNumber } from "ethers"
import { FC, useMemo } from "react"

import { EstimateFeeResponse } from "../../../../shared/messages/TransactionMessage"
import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { Token } from "../../../../shared/token/type"
import { FeeEstimationBox } from "./ui/FeeEstimationBox"
import { FeeEstimationText } from "./ui/FeeEstimationText"
import { InsufficientFundsAccordion } from "./ui/InsufficientFundsAccordion"
import { TransactionFailureAccordion } from "./ui/TransactionFailureAccordion"
import { getTooltipText } from "./utils"

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
