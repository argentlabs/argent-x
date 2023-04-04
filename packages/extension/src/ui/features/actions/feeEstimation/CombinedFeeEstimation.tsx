import { L1, P4, TextWithAmount } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { BigNumber, utils } from "ethers"
import { FC, useEffect, useMemo } from "react"
import { number } from "starknet"

import { EstimateFeeResponse } from "../../../../shared/messages/TransactionMessage"
import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { Token } from "../../../../shared/token/type"
import { getFeeToken } from "../../../../shared/token/utils"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { TransactionsFeeEstimationProps } from "./types"
import { FeeEstimationBox } from "./ui/FeeEstimationBox"
import { FeeEstimationText } from "./ui/FeeEstimationText"
import { InsufficientFundsAccordion } from "./ui/InsufficientFundsAccordion"
import { TransactionFailureAccordion } from "./ui/TransactionFailureAccordion"
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

export interface CombinedFeeEstimationProps {
  amountCurrencyValue?: string
  fee?: EstimateFeeResponse
  feeToken?: Token
  feeTokenBalance?: BigNumber
  parsedFeeEstimationError: string | false
  showError: boolean
  showEstimateError: boolean
  showFeeError: boolean
  totalFee?: string
  totalMaxFee?: string
  totalMaxFeeCurrencyValue?: string
}

export const CombinedFeeEstimation: FC<CombinedFeeEstimationProps> = ({
  amountCurrencyValue,
  fee,
  feeToken,
  feeTokenBalance,
  parsedFeeEstimationError,
  showError,
  showEstimateError,
  showFeeError,
  totalFee,
  totalMaxFee,
  totalMaxFeeCurrencyValue,
}) => {
  const tooltipText = useMemo(() => {
    if (feeToken) {
      return (
        <TooltipText
          feeToken={feeToken}
          feeTokenBalance={feeTokenBalance}
          totalMaxFee={totalMaxFee}
          maxAccountDeploymentFee={fee?.maxADFee}
          maxNetworkFee={fee?.suggestedMaxFee}
        />
      )
    }
  }, [
    fee?.maxADFee,
    fee?.suggestedMaxFee,
    feeToken,
    feeTokenBalance,
    totalMaxFee,
  ])
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
  feeToken: Token
  maxNetworkFee?: string
  maxAccountDeploymentFee?: string
  totalMaxFee?: string
  feeTokenBalance?: BigNumber
}

const TooltipText: FC<FeeEstimationTooltipProps> = ({
  feeToken,
  feeTokenBalance,
  maxAccountDeploymentFee,
  maxNetworkFee,
  totalMaxFee,
}) => {
  if (
    !maxNetworkFee ||
    !maxAccountDeploymentFee ||
    !totalMaxFee ||
    !feeTokenBalance
  ) {
    return (
      <P4 color="neutrals.300" fontWeight={"normal"}>
        Network fee is still loading
      </P4>
    )
  }
  if (feeTokenBalance.gte(totalMaxFee)) {
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
      {utils.formatEther(BigNumber.from(totalMaxFee).sub(feeTokenBalance))} ETH
      more.
    </P4>
  )
}
