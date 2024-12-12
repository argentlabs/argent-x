import { getTokenIconUrl, TextWithAmount } from "@argent/x-ui"
import type { FC } from "react"
import { useMemo } from "react"

import { isUndefined } from "lodash-es"
import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
  estimatedFeesToTotal,
  estimatedFeesToMaxFeeTotal,
} from "@argent/x-shared"
import {
  FeeEstimationBox,
  FeeEstimationBoxWithDeploy,
  FeeEstimationBoxWithInsufficientFunds,
} from "./ui/FeeEstimationBox"
import { FeeEstimationText } from "./ui/FeeEstimationText"
import { TransactionFailureAccordion } from "./ui/TransactionFailureAccordion"
import { getTooltipText } from "./utils"
import type { FeeEstimationProps } from "./feeEstimation.model"

export const FeeEstimation: FC<FeeEstimationProps> = ({
  amountCurrencyValue,
  fee,
  feeToken,
  parsedFeeEstimationError,
  showEstimateError,
  showFeeError,
  suggestedMaxFeeCurrencyValue,
  userClickedAddFunds = false,
  needsDeploy,
  onOpenFeeTokenPicker,
  allowFeeTokenSelection = true,
}) => {
  const amount = fee && estimatedFeesToTotal(fee)
  const maxFee = fee && estimatedFeesToMaxFeeTotal(fee)

  const tooltipText = useMemo(() => {
    if (maxFee) {
      return getTooltipText(maxFee, feeToken.balance)
    }
  }, [feeToken.balance, maxFee])
  const primaryText = useMemo(() => {
    if (amountCurrencyValue) {
      return prettifyCurrencyValue(amountCurrencyValue)
    }

    if (amount) {
      return (
        <TextWithAmount amount={amount} decimals={feeToken.decimals}>
          <>
            {prettifyTokenAmount({
              amount,
              decimals: feeToken.decimals,
              symbol: feeToken.symbol,
            })}
          </>
        </TextWithAmount>
      )
    }
  }, [amount, amountCurrencyValue, feeToken])

  const secondaryText = useMemo(() => {
    if (suggestedMaxFeeCurrencyValue) {
      return `Max ${prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)}`
    }

    if (maxFee) {
      return (
        <TextWithAmount amount={maxFee} decimals={feeToken.decimals}>
          <>
            Max&nbsp;
            {feeToken ? (
              prettifyTokenAmount({
                amount: maxFee,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{maxFee} Unknown</>
            )}
          </>
        </TextWithAmount>
      )
    }
  }, [feeToken, maxFee, suggestedMaxFeeCurrencyValue])

  const [feeTokenIcon, feeTokenSymbol] = useMemo(
    () => [getTokenIconUrl(feeToken), feeToken.symbol],
    [feeToken],
  )

  const isLoading = !fee || isUndefined(feeToken.balance) // because 0n is a valid balance but falsy

  if (showFeeError) {
    return (
      <FeeEstimationBoxWithInsufficientFunds
        userClickedAddFunds={userClickedAddFunds}
      >
        <FeeEstimationText
          tooltipText={tooltipText}
          primaryText={primaryText}
          secondaryText={secondaryText}
          isLoading={isLoading}
          feeTokenIcon={feeTokenIcon}
          feeTokenSymbol={feeTokenSymbol}
          onOpenFeeTokenPicker={onOpenFeeTokenPicker}
          allowFeeTokenSelection={allowFeeTokenSelection}
        />
      </FeeEstimationBoxWithInsufficientFunds>
    )
  }

  if (!showEstimateError) {
    return needsDeploy ? (
      <FeeEstimationBoxWithDeploy>
        <FeeEstimationText
          tooltipText={tooltipText}
          primaryText={primaryText}
          secondaryText={secondaryText}
          isLoading={isLoading}
          onOpenFeeTokenPicker={onOpenFeeTokenPicker}
          feeTokenIcon={feeTokenIcon}
          feeTokenSymbol={feeTokenSymbol}
          allowFeeTokenSelection={allowFeeTokenSelection}
        />
      </FeeEstimationBoxWithDeploy>
    ) : (
      <FeeEstimationBox>
        <FeeEstimationText
          tooltipText={tooltipText}
          primaryText={primaryText}
          secondaryText={secondaryText}
          isLoading={isLoading}
          feeTokenIcon={feeTokenIcon}
          feeTokenSymbol={feeTokenSymbol}
          onOpenFeeTokenPicker={onOpenFeeTokenPicker}
          allowFeeTokenSelection={allowFeeTokenSelection}
        />
      </FeeEstimationBox>
    )
  }
  // if (userClickedAddFunds) {
  //   return <WaitingForFunds />
  // }

  return (
    <TransactionFailureAccordion
      parsedFeeEstimationError={parsedFeeEstimationError}
    />
  )
}
