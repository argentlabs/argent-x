import { getTokenIconUrl } from "@argent/x-ui"
import type { FC } from "react"
import { useMemo } from "react"

import { isUndefined } from "lodash-es"
import {
  FeeEstimationBox,
  FeeEstimationBoxWithDeploy,
  FeeEstimationBoxWithInsufficientFunds,
} from "./ui/FeeEstimationBox"
import { FeeEstimationText } from "./ui/FeeEstimationText"
import { TransactionFailureAccordion } from "./ui/TransactionFailureAccordion"
import type { FeeEstimationProps } from "./feeEstimation.model"
import { useFeeAmount } from "./useFeeAmount"

export const FeeEstimation: FC<FeeEstimationProps> = ({
  fee,
  feeToken,
  parsedFeeEstimationError,
  showEstimateError,
  showInsufficientFeeError,
  userClickedAddFunds = false,
  needsDeploy,
  onOpenFeeTokenPicker,
  allowFeeTokenSelection = true,
  isSubsidised,
}) => {
  const feeAmount = useFeeAmount({
    fee,
    feeToken,
    isSubsidised,
  })
  const secondaryText = isSubsidised ? "Paid by Argent" : undefined

  const [feeTokenIcon, feeTokenSymbol] = useMemo(
    () => [getTokenIconUrl(feeToken), feeToken.symbol],
    [feeToken],
  )

  const isLoading = !fee || isUndefined(feeToken.balance) // because 0n is a valid balance but falsy

  if (showInsufficientFeeError) {
    return (
      <FeeEstimationBoxWithInsufficientFunds
        userClickedAddFunds={userClickedAddFunds}
      >
        <FeeEstimationText
          primaryText={feeAmount}
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
    return needsDeploy && !isSubsidised ? (
      <FeeEstimationBoxWithDeploy>
        <FeeEstimationText
          primaryText={feeAmount}
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
          primaryText={feeAmount}
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
