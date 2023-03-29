import { L1, L2, P4, TextWithAmount, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { Collapse } from "@mui/material"
import { BigNumber } from "ethers"
import { FC, useEffect, useMemo, useState } from "react"
import { number } from "starknet"

import { EstimateFeeResponse } from "../../../../shared/messages/TransactionMessage"
import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { Token } from "../../../../shared/token/type"
import { CopyTooltip } from "../../../components/CopyTooltip"
import { makeClickable } from "../../../services/a11y"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { ExtendableControl } from "./styled"
import { TransactionsFeeEstimationProps } from "./types"
import { FeeEstimationBox } from "./ui/FeeEstimationBox"
import { getTooltipText, useMaxFeeEstimation } from "./utils"
import { getParsedError } from "./utils"

const { AlertIcon, ChevronDownIcon } = icons

export const FeeEstimationContainer: FC<TransactionsFeeEstimationProps> = ({
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
  showEstimateError,
  showFeeError,
  suggestedMaxFeeCurrencyValue,
}) => {
  const [feeEstimateExpanded, setFeeEstimateExpanded] = useState(false)
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
          <L2 color="neutrals.300">
            (Max &nbsp;
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
          </L2>
        </TextWithAmount>
      )
    }
  }, [fee, feeToken, suggestedMaxFeeCurrencyValue])
  const hasError = !fee && showEstimateError
  return (
    <Flex direction="column" gap="1">
      <FeeEstimationBox
        tooltipText={getTooltipText(fee?.suggestedMaxFee, feeTokenBalance)}
        primaryText={primaryText}
        secondaryText={secondaryText}
        hasError={hasError}
      />

      {showError && (
        <Flex
          direction="column"
          backgroundColor="#330105"
          boxShadow="menu"
          p="3.5"
          borderRadius="xl"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Flex gap="1" align="center">
              <Text color="errorText">
                <AlertIcon />
              </Text>
              <L1 color="errorText">
                {showFeeError
                  ? "Not enough funds to cover for fees"
                  : "Transaction failure predicted"}
              </L1>
            </Flex>
            {!showFeeError && (
              <ExtendableControl
                {...makeClickable(() => setFeeEstimateExpanded((x) => !x), {
                  label: "Show error details",
                })}
              >
                <Text color="errorText">
                  <ChevronDownIcon
                    style={{
                      transition: "transform 0.2s ease-in-out",
                      transform: feeEstimateExpanded
                        ? "rotate(-180deg)"
                        : "rotate(0deg)",
                    }}
                    height="14px"
                    width="16px"
                  />
                </Text>
              </ExtendableControl>
            )}
          </Flex>

          <Collapse
            in={feeEstimateExpanded}
            timeout="auto"
            style={{
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            {parsedFeeEstimationError && (
              <CopyTooltip
                copyValue={parsedFeeEstimationError}
                message="Copied"
              >
                <P4 color="errorText" pt="3" whiteSpace="pre-wrap">
                  {parsedFeeEstimationError}
                </P4>
              </CopyTooltip>
            )}
          </Collapse>
        </Flex>
      )}
    </Flex>
  )
}
