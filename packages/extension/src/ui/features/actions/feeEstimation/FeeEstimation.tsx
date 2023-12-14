import { TextWithAmount } from "@argent/ui"
import { FC, useMemo } from "react"

import { isUndefined } from "lodash-es"
import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import {
  FeeEstimationBox,
  FeeEstimationBoxWithDeploy,
} from "./ui/FeeEstimationBox"
import { FeeEstimationText } from "./ui/FeeEstimationText"
import { InsufficientFundsAccordion } from "./ui/InsufficientFundsAccordion"
import { TransactionFailureAccordion } from "./ui/TransactionFailureAccordion"
import { WaitingForFunds } from "./ui/WaitingForFunds"
import { getTooltipText } from "./utils"
import { FeeEstimationProps } from "./feeEstimation.model"

export const FeeEstimation: FC<FeeEstimationProps> = ({
  amountCurrencyValue,
  fee,
  feeToken,
  feeTokenBalance,
  parsedFeeEstimationError,
  showError,
  showFeeError,
  suggestedMaxFeeCurrencyValue,
  userClickedAddFunds,
  needsDeploy,
}) => {
  const tooltipText = useMemo(() => {
    if (fee) {
      const suggestedMaxFeeBN = BigInt(fee.suggestedMaxFee)
      return getTooltipText(suggestedMaxFeeBN, feeTokenBalance)
    }
  }, [fee, feeTokenBalance])
  const primaryText = useMemo(() => {
    if (fee) {
      return (
        <TextWithAmount amount={fee.amount} decimals={feeToken.decimals}>
          <>
            {feeToken ? (
              prettifyTokenAmount({
                amount: fee.amount,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{fee.amount} Unknown</>
            )}
            {amountCurrencyValue !== undefined &&
              ` (${prettifyCurrencyValue(amountCurrencyValue)})`}
          </>
        </TextWithAmount>
      )
    }
  }, [amountCurrencyValue, fee, feeToken])
  const secondaryText = useMemo(() => {
    if (fee) {
      return (
        <TextWithAmount
          amount={fee.suggestedMaxFee}
          decimals={feeToken.decimals}
        >
          <>
            Max&nbsp;
            {feeToken ? (
              prettifyTokenAmount({
                amount: fee.suggestedMaxFee,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{fee.suggestedMaxFee} Unknown</>
            )}
            {suggestedMaxFeeCurrencyValue !== undefined &&
              ` (Max ${prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)})`}
          </>
        </TextWithAmount>
      )
    }
  }, [fee, feeToken, suggestedMaxFeeCurrencyValue])
  const isLoading = !fee || isUndefined(feeTokenBalance) // because 0n is a valid balance but falsy

  if (!showError) {
    return needsDeploy ? (
      <FeeEstimationBoxWithDeploy>
        <FeeEstimationText
          tooltipText={tooltipText}
          primaryText={primaryText}
          secondaryText={secondaryText}
          isLoading={isLoading}
        />
      </FeeEstimationBoxWithDeploy>
    ) : (
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
  if (userClickedAddFunds) {
    return <WaitingForFunds />
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
