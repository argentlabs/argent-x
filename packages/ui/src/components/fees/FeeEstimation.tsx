import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
  useTokenAmountToCurrencyValue,
} from "@argent/shared"
import { Flex, Text, Tooltip, useColorMode } from "@chakra-ui/react"
import { AnimatePresence } from "framer-motion"
import { FC, useEffect, useMemo } from "react"

import { InfoIcon } from "../icons"
import { LoadingPulse } from "../LoadingPulse"
import { MotionBox } from "../MotionBox"
import { L2, P4 } from "../Typography"
import { FeeEstimateError } from "./FeeEstimateError"
import { TransactionsFeeEstimationProps } from "./types"
import { getParsedError, getTooltipTextBase } from "./utils"

export const FeeEstimation: FC<TransactionsFeeEstimationProps> = ({
  onErrorChange,
  enoughBalance,
  executionFees,
  feeTokenWithBalance,
  error,
}) => {
  const { colorMode } = useColorMode()
  const isDark = useMemo(() => colorMode === "dark", [colorMode])

  const showFeeError = Boolean(
    executionFees && feeTokenWithBalance && !enoughBalance,
  )
  const showEstimateError = Boolean(error)
  const showError = showFeeError || showEstimateError

  const hasError =
    !executionFees || !feeTokenWithBalance || !enoughBalance || showError

  useEffect(() => {
    onErrorChange?.(hasError)
    // only rerun when error changes
  }, [hasError]) // eslint-disable-line react-hooks/exhaustive-deps

  const parsedFeeEstimationError = useMemo(() => {
    if (showEstimateError) {
      return getParsedError(error)
    }
    return undefined
  }, [showEstimateError, error])

  const amountCurrencyValue = useTokenAmountToCurrencyValue(
    feeTokenWithBalance,
    executionFees?.fee,
  )
  const suggestedMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeTokenWithBalance,
    executionFees?.maxFee,
  )

  return (
    <Flex direction="column" gap="1" w="100%">
      <Flex
        borderRadius="xl"
        backgroundColor={isDark ? "neutrals.900" : "white"}
        border="1px"
        borderColor={isDark ? "neutrals.900" : "transparent"}
        boxShadow={isDark ? "menu" : "none"}
        justifyContent="space-between"
        px="3"
        py="3.5"
        gap="2"
        flexWrap="nowrap"
      >
        <Flex alignItems="center" justifyContent="center" gap="5px">
          <P4 fontWeight="bold" color={isDark ? "neutrals.300" : "black"}>
            Network fee
          </P4>

          <Tooltip
            label={getTooltipTextBase(
              executionFees?.maxFee,
              feeTokenWithBalance?.balance,
            )}
            p="3"
            placement="top"
            backgroundColor={isDark ? "black" : "white"}
            border="1px solid"
            borderColor="neutrals.700"
            borderRadius="4px"
          >
            <Text
              color={isDark ? "neutrals.300" : "black"}
              _hover={{
                cursor: "pointer",
                color: isDark ? "neutrals.300" : "gray.300",
              }}
            >
              <InfoIcon />
            </Text>
          </Tooltip>
        </Flex>
        {executionFees ? (
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
                <P4 fontWeight="bold">
                  ≈{" "}
                  {feeTokenWithBalance ? (
                    prettifyTokenAmount({
                      amount: executionFees.fee,
                      decimals: feeTokenWithBalance.decimals,
                      symbol: feeTokenWithBalance.symbol,
                    })
                  ) : (
                    <>{executionFees.fee} Unknown</>
                  )}
                </P4>
              )}
            </Flex>

            {suggestedMaxFeeCurrencyValue !== undefined ? (
              <L2 color={isDark ? "neutrals.300" : "black"}>
                (Max {prettifyCurrencyValue(suggestedMaxFeeCurrencyValue)})
              </L2>
            ) : (
              <L2 color={isDark ? "neutrals.300" : "black"}>
                (Max &nbsp;
                {feeTokenWithBalance ? (
                  prettifyTokenAmount({
                    amount: executionFees.maxFee,
                    decimals: feeTokenWithBalance.decimals,
                    symbol: feeTokenWithBalance.symbol,
                  })
                ) : (
                  <>{executionFees.maxFee} Unknown</>
                )}
                )
              </L2>
            )}
          </Flex>
        ) : showEstimateError ? (
          <P4
            display="inline-block"
            marginInlineStart="0.3em"
            _notLast={{ marginInlineEnd: "0.3em" }}
          >
            Error
          </P4>
        ) : (
          <LoadingPulse />
        )}
      </Flex>

      <AnimatePresence>
        {showError && (
          <MotionBox
            overflow={"hidden"}
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: "100%" }}
            exit={{ opacity: 0, maxHeight: 0 }}
          >
            <FeeEstimateError
              parsedFeeEstimationError={parsedFeeEstimationError}
              showFeeError={showFeeError}
            />
          </MotionBox>
        )}
      </AnimatePresence>
    </Flex>
  )
}
