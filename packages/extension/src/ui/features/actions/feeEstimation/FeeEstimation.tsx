import { L1, L2, P4, Pre, TextWithAmount, icons } from "@argent/ui"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import { Collapse } from "@mui/material"
import { FC, useEffect, useMemo, useState } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { CopyTooltip } from "../../../components/CopyTooltip"
import { makeClickable } from "../../../services/a11y"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { ExtendableControl, FeeEstimationValue, LoadingInput } from "./styled"
import { FeeEstimationProps } from "./types"
import { getTooltipText } from "./utils"
import { getParsedError } from "./utils"

const { AlertIcon, ChevronDownIcon, InfoIcon } = icons

export const FeeEstimation: FC<FeeEstimationProps> = ({
  accountAddress,
  networkId,
  fee,
  feeError,
  onErrorChange,
}) => {
  const account = useAccount({ address: accountAddress, networkId })
  if (!account) {
    throw new Error("Account not found")
  }

  const [feeEstimateExpanded, setFeeEstimateExpanded] = useState(false)

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const enoughBalance = useMemo(
    () =>
      Boolean(
        fee?.suggestedMaxFee && feeTokenBalance?.gte(fee.suggestedMaxFee),
      ),
    [feeTokenBalance, fee?.suggestedMaxFee],
  )

  const showFeeError = Boolean(fee && feeTokenBalance && !enoughBalance)
  const showEstimateError = Boolean(feeError)
  const showError = showFeeError || showEstimateError

  const hasError = !fee || !feeTokenBalance || !enoughBalance || showError
  useEffect(() => {
    onErrorChange?.(hasError)
  }, [hasError, onErrorChange])

  const parsedFeeEstimationError = showEstimateError && getParsedError(feeError)
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
    <Flex direction="column" gap="1">
      <Flex
        borderRadius="xl"
        backgroundColor="neutrals.900"
        border="1px"
        borderColor="neutrals.500"
        boxShadow="menu"
        justifyContent="space-between"
        px="3"
        py="3.5"
        gap="2"
        flexWrap="nowrap"
      >
        <Flex alignItems="center" justifyContent="center" gap="5px">
          <P4 fontWeight="bold" color="neutrals.300">
            Network fee
          </P4>

          <Tooltip
            label={getTooltipText(fee?.suggestedMaxFee, feeTokenBalance)}
            p="3"
            placement="top"
            backgroundColor="black"
            border="1px solid"
            borderColor="neutrals.700"
            borderRadius="4px"
          >
            <Text
              color="neutrals.300"
              _hover={{
                cursor: "pointer",
                color: "white",
              }}
            >
              <InfoIcon />
            </Text>
          </Tooltip>
        </Flex>
        {fee ? (
          <Flex
            gap="1"
            alignItems="center"
            direction="row-reverse"
            flexWrap="wrap"
          >
            <Flex alignItems="center">
              {amountCurrencyValue !== undefined ? (
                <P4 fontWeight="bold">
                  ≈ {prettifyCurrencyValue(amountCurrencyValue)}
                </P4>
              ) : (
                <TextWithAmount
                  amount={fee.amount}
                  decimals={feeToken.decimals}
                >
                  <P4 fontWeight="bold">
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
                  </P4>
                </TextWithAmount>
              )}
            </Flex>

            {suggestedMaxFeeCurrencyValue !== undefined ? (
              <L2 color="neutrals.300">
                (Max {prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)})
              </L2>
            ) : (
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
            )}
          </Flex>
        ) : showEstimateError ? (
          <FeeEstimationValue>Error</FeeEstimationValue>
        ) : (
          <LoadingInput />
        )}
      </Flex>

      {showError && (
        <Flex
          direction="column"
          backgroundColor="#330105"
          boxShadow="menu"
          py="3.5"
          px="3.5"
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
                <Pre color="errorText" pt="3" whiteSpace="pre-wrap">
                  {parsedFeeEstimationError}
                </Pre>
              </CopyTooltip>
            )}
          </Collapse>
        </Flex>
      )}
    </Flex>
  )
}
