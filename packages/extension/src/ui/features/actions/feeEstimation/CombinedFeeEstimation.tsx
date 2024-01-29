import { TokenWithBalance, bigDecimal } from "@argent/shared"
import { L1, P4, TextWithAmount } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useMemo } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { ParsedFeeError } from "./feeError"
import { FeeEstimationBox } from "./ui/FeeEstimationBox"
import { FeeEstimationText } from "./ui/FeeEstimationText"
import { InsufficientFundsAccordion } from "./ui/InsufficientFundsAccordion"
import { TransactionFailureAccordion } from "./ui/TransactionFailureAccordion"
import { WaitingForFunds } from "./ui/WaitingForFunds"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import { estimatedFeeToMaxFeeTotal } from "../../../../shared/transactionSimulation/utils"
import { num } from "starknet"

export interface CombinedFeeEstimationProps {
  allowFeeTokenSelection?: boolean
  amountCurrencyValue?: string
  fee?: EstimatedFees
  feeToken?: TokenWithBalance
  parsedFeeEstimationError?: ParsedFeeError
  showError: boolean
  showEstimateError: boolean
  showFeeError: boolean
  totalFee?: string
  totalMaxFee?: string
  totalMaxFeeCurrencyValue?: string
  userClickedAddFunds?: boolean
}

export const CombinedFeeEstimation: FC<CombinedFeeEstimationProps> = ({
  allowFeeTokenSelection,
  amountCurrencyValue,
  fee,
  feeToken,
  parsedFeeEstimationError,
  showError,
  showEstimateError,
  showFeeError,
  totalFee,
  totalMaxFee,
  totalMaxFeeCurrencyValue,
  userClickedAddFunds,
}) => {
  const tooltipText = useMemo(() => {
    if (feeToken) {
      return (
        <TooltipText
          feeToken={feeToken}
          totalMaxFee={totalMaxFee}
          maxAccountDeploymentFee={
            fee?.deployment
              ? num.toHex(estimatedFeeToMaxFeeTotal(fee.deployment))
              : undefined
          }
          maxNetworkFee={
            fee
              ? num.toHex(estimatedFeeToMaxFeeTotal(fee.transactions))
              : undefined
          }
        />
      )
    }
  }, [fee, feeToken, totalMaxFee])
  const primaryText = useMemo(() => {
    if (totalFee && totalMaxFee) {
      if (amountCurrencyValue !== undefined) {
        return `≈ ${prettifyCurrencyValue(amountCurrencyValue)}`
      }
      return (
        <TextWithAmount amount={totalFee} decimals={feeToken?.decimals}>
          <>
            ≈{" "}
            {feeToken ? (
              prettifyTokenAmount({
                amount: totalFee,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{totalFee} Unknown</>
            )}
          </>
        </TextWithAmount>
      )
    }
  }, [amountCurrencyValue, feeToken, totalFee, totalMaxFee])
  const secondaryText = useMemo(() => {
    if (totalFee && totalMaxFee) {
      if (totalMaxFeeCurrencyValue !== undefined) {
        return `(Max ${prettifyCurrencyValue(totalMaxFeeCurrencyValue)})`
      }
      return (
        <TextWithAmount amount={totalMaxFee} decimals={feeToken?.decimals}>
          <>
            (Max&nbsp;
            {feeToken ? (
              prettifyTokenAmount({
                amount: totalMaxFee,
                decimals: feeToken.decimals,
                symbol: feeToken.symbol,
              })
            ) : (
              <>{totalMaxFee} Unknown</>
            )}
            )
          </>
        </TextWithAmount>
      )
    }
  }, [feeToken, totalFee, totalMaxFee, totalMaxFeeCurrencyValue])
  const isLoading = !(totalFee && totalMaxFee) && !showEstimateError
  if (!showError) {
    return (
      <FeeEstimationBox>
        <FeeEstimationText
          allowFeeTokenSelection={allowFeeTokenSelection}
          title={"Network fees"}
          tooltipText={tooltipText}
          subtitle={"Includes one-time activation fee"}
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
        title={"Network fees"}
        tooltipText={tooltipText}
        subtitle={"Includes one-time activation fee"}
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

interface FeeEstimationTooltipProps {
  feeToken: TokenWithBalance
  maxNetworkFee?: string
  maxAccountDeploymentFee?: string
  totalMaxFee?: string
}

const TooltipText: FC<FeeEstimationTooltipProps> = ({
  feeToken,
  maxAccountDeploymentFee,
  maxNetworkFee,
  totalMaxFee,
}) => {
  if (!maxNetworkFee || !maxAccountDeploymentFee || !totalMaxFee || !feeToken) {
    return (
      <P4 color="neutrals.300" fontWeight={"normal"}>
        Network fee is still loading
      </P4>
    )
  }
  if (feeToken.balance >= BigInt(totalMaxFee)) {
    return (
      <Flex flexDirection="column" gap={3} px={1} py={2}>
        <P4 color="neutrals.300" fontWeight={"normal"}>
          Network fees are paid to the network to include transactions in blocks
        </P4>

        <Flex flexDirection="column" gap="1">
          <Flex justifyContent="space-between">
            <L1 color="white">Starknet Network</L1>
            <TextWithAmount amount={maxNetworkFee} decimals={feeToken.decimals}>
              <L1 color="white">
                ≈{" "}
                {prettifyTokenAmount({
                  amount: maxNetworkFee,
                  decimals: feeToken.decimals,
                  symbol: feeToken.symbol,
                })}
              </L1>
            </TextWithAmount>
          </Flex>
          <Flex justifyContent="space-between">
            <L1 color="white">One-time activation fee</L1>
            <TextWithAmount
              amount={maxAccountDeploymentFee}
              decimals={feeToken.decimals}
            >
              <L1 color="white">
                ≈{" "}
                {prettifyTokenAmount({
                  amount: maxAccountDeploymentFee,
                  decimals: feeToken.decimals,
                  symbol: feeToken.symbol,
                })}
              </L1>
            </TextWithAmount>
          </Flex>
        </Flex>
      </Flex>
    )
  }
  return (
    <P4 color="neutrals.500">
      Insufficient balance to pay network fees. You need at least $
      {bigDecimal.formatEther(BigInt(totalMaxFee) - feeToken.balance)} ETH more.
    </P4>
  )
}
