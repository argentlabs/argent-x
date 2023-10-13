import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
  useTokenAmountToCurrencyValue,
} from "@argent/shared"
import { Flex, Text, Tooltip, useColorMode } from "@chakra-ui/react"
import { AnimatePresence } from "framer-motion"
import { FC, useEffect, useMemo } from "react"
import { num } from "starknet"

import { InfoIcon } from "../icons"
import { LoadingPulse } from "../LoadingPulse"
import { MotionBox } from "../MotionBox"
import { L2, P4 } from "../Typography"
import { FeeEstimateError } from "./FeeEstimateError"
import { TransactionsFeeEstimationProps } from "./types"
import { TooltipTextCombined, getParsedError } from "./utils"

export const CombinedFeeEstimation: FC<
  TransactionsFeeEstimationProps & { extensionIsInTab?: boolean }
> = ({
  onErrorChange,
  enoughBalance,
  deploymentFees,
  executionFees,
  feeTokenWithBalance,
  extensionIsInTab,
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
  const totalFee = useMemo(() => {
    if (deploymentFees?.needsDeploy && executionFees?.fee) {
      return num.toHex(deploymentFees.fee + executionFees.fee)
    }
    return executionFees?.fee
  }, [executionFees, deploymentFees])

  const totalMaxFee = useMemo(() => {
    if (deploymentFees?.needsDeploy && deploymentFees?.maxFee) {
      return deploymentFees.maxFee + (executionFees?.maxFee ?? 0n)
    }
    return executionFees?.maxFee
  }, [executionFees, deploymentFees])

  const totalMaxFeeCurrencyValue = useTokenAmountToCurrencyValue(
    feeTokenWithBalance,
    totalMaxFee,
  )

  const maxADFee = useMemo(() => {
    return deploymentFees?.needsDeploy ? deploymentFees.maxFee : undefined
  }, [deploymentFees])

  return (
    <Flex direction="column" gap="1" width={"100%"}>
      <Flex
        borderRadius="xl"
        backgroundColor={isDark ? "neutrals.900" : "white"}
        border="1px"
        borderColor={isDark ? "neutrals.500" : "transparent"}
        boxShadow={isDark ? "menu" : "none"}
        justifyContent="space-between"
        alignItems="flex-start"
        px="3"
        py="3.5"
        gap="1.5"
      >
        <Flex flexDirection="column" gap="2" alignItems="flex-start">
          <Flex alignItems="center" justifyContent="center" gap="5px">
            <P4 fontWeight="bold" color={isDark ? "neutrals.300" : "black"}>
              Network fees
            </P4>
            {feeTokenWithBalance && (
              <Tooltip
                label={
                  <TooltipTextCombined
                    feeToken={feeTokenWithBalance}
                    totalMaxFee={totalMaxFee}
                    maxAccountDeploymentFee={maxADFee}
                    maxNetworkFee={executionFees?.maxFee}
                  />
                }
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
            )}
          </Flex>

          <L2 color={isDark ? "neutrals.300" : "black"}>
            Includes one-time activation fee
          </L2>
        </Flex>
        {totalFee && totalMaxFee ? (
          <Flex
            gap="2"
            alignItems="flex-end"
            direction={extensionIsInTab ? "row" : "column-reverse"}
          >
            {totalMaxFeeCurrencyValue !== undefined ? (
              <L2 color={isDark ? "neutrals.300" : "black"}>
                (Max {prettifyCurrencyValue(totalMaxFeeCurrencyValue)})
              </L2>
            ) : (
              <L2 color={isDark ? "neutrals.300" : "black"}>
                (Max &nbsp;
                {feeTokenWithBalance ? (
                  prettifyTokenAmount({
                    amount: totalMaxFee,
                    decimals: feeTokenWithBalance.decimals,
                    symbol: feeTokenWithBalance.symbol,
                  })
                ) : (
                  <>{totalMaxFee} Unknown</>
                )}
                )
              </L2>
            )}

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
                      amount: totalFee,
                      decimals: feeTokenWithBalance.decimals,
                      symbol: feeTokenWithBalance.symbol,
                    })
                  ) : (
                    <>{totalFee} Unknown</>
                  )}
                </P4>
              )}
            </Flex>
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
          <Flex flex={0.5}>
            <LoadingPulse
              isLoading={!executionFees && !showEstimateError}
              bg="neutrals.100"
              w="100%"
            />
          </Flex>
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
