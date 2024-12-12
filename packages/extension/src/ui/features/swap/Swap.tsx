import { Button, CellStack, icons, L2Bold } from "@argent/x-ui"
import { Box, chakra, Flex, IconButton, keyframes } from "@chakra-ui/react"
import { useCallback, useEffect, useMemo, useState } from "react"

import type { Address } from "@argent/x-shared"
import { bigDecimal, ensureDecimals } from "@argent/x-shared"
import type { Token } from "../../../shared/token/__new/types/token.model"
import { delay } from "../../../shared/utils/delay"
import { useSwapActionHandlers } from "./hooks/useSwapActionHandler"
import { useSwapCallback } from "./hooks/useSwapCallback"
import { SwapInputError, useSwapInfo } from "./hooks/useSwapInfo"
import { Field, useSwapState } from "./state/fields"
import { useUserState } from "./state/user"
import { SwapInputPanel } from "./ui/SwapInputPanel"
import { SwapPricesInfo } from "./ui/SwapPricesInfo"
import { SwapQuoteRefresh } from "./ui/SwapQuoteRefresh"
import { SwapTradeLoading } from "./ui/SwapTradeLoading"
import { maxAmountSpendFromTokenBalance } from "./utils"

const { SwitchPrimaryIcon } = icons

const SwapContainer = chakra(CellStack, {
  baseStyle: {
    position: "relative",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    py: "8px",
  },
})

const SwitchDirectionButton = chakra(IconButton, {
  baseStyle: {
    backgroundColor: "neutrals.800",
    display: "flex",
    border: "2px solid",
    borderColor: "neutrals.900",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "100px",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    minHeight: "32px",
    minWidth: "32px",
    padding: "10.25px",
    _active: {
      transform: "translate(-50%, -50%)",
    },
  },
})

const StyledSwitchDirectionIcon = chakra(SwitchPrimaryIcon, {
  baseStyle: {
    color: "neutrals.300",
  },
})

export const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(180deg); }
`

const Swap = ({ tokenAddress }: { tokenAddress?: Address }) => {
  const {
    tokens,
    tokenBalances,
    trade,
    tradeLoading,
    parsedAmount,
    inputError: swapInputError,
  } = useSwapInfo()
  const { independentField, typedValue, resetTypedValue, setDefaultPayToken } =
    useSwapState()
  const { onTokenSelection, onUserInput, onSwitchTokens } =
    useSwapActionHandlers()
  const { userSlippageTolerance } = useUserState()

  const [rotate, setRotate] = useState(false)
  const [swapUnavailable, setSwapUnavailable] = useState(false)

  const payToken = tokens[Field.PAY]
  const receiveToken = tokens[Field.RECEIVE]

  useEffect(() => {
    if (tokenAddress) {
      setDefaultPayToken(tokenAddress)
    }
  }, [setDefaultPayToken, tokenAddress])

  const parsedAmounts = useMemo(
    () => ({
      [Field.PAY]:
        independentField === Field.PAY
          ? parsedAmount
          : BigInt(trade?.payAmount ?? 0),
      [Field.RECEIVE]:
        independentField === Field.RECEIVE
          ? parsedAmount
          : BigInt(trade?.receiveAmount ?? 0),
    }),
    [independentField, parsedAmount, trade],
  )

  useEffect(() => {
    resetTypedValue()
  }, [resetTypedValue])

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.PAY, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.RECEIVE, value)
    },
    [onUserInput],
  )

  const dependentField: Field =
    independentField === Field.PAY ? Field.RECEIVE : Field.PAY

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: bigDecimal.formatUnits({
        value: parsedAmounts[dependentField] ?? 0n,
        decimals: ensureDecimals(tokens[dependentField]?.decimals),
      }),
    }),
    [dependentField, independentField, parsedAmounts, typedValue, tokens],
  )

  const payTokenBalance = tokenBalances[Field.PAY]
  const payAmount = parsedAmounts[Field.PAY]

  const maxAmountInput = maxAmountSpendFromTokenBalance(payTokenBalance)

  const hasZeroBalance = !payTokenBalance || payTokenBalance.balance === 0n

  const atMaxAmountInput = Boolean(
    maxAmountInput !== undefined && payAmount && payAmount === maxAmountInput,
  )

  const handleInputSelect = useCallback(
    (payToken: Token) => {
      onTokenSelection(Field.PAY, payToken)
      handleTypeInput("")
    },
    [handleTypeInput, onTokenSelection],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput !== undefined && payToken?.decimals) {
      onUserInput(
        Field.PAY,
        bigDecimal.formatUnits({
          value: maxAmountInput,
          decimals: payToken.decimals,
        }),
      )
    }
  }, [maxAmountInput, onUserInput, payToken?.decimals])

  const handleOutputSelect = useCallback(
    (receiveToken: Token) => onTokenSelection(Field.RECEIVE, receiveToken),
    [onTokenSelection],
  )

  const noRoute = !trade?.route

  const independentFieldAmount = parsedAmounts[independentField]

  const userHasSpecifiedInputOutput = Boolean(
    payToken &&
      receiveToken &&
      independentFieldAmount &&
      independentFieldAmount > 0n,
  )

  const insufficientLiquidityError =
    !tradeLoading && userHasSpecifiedInputOutput && noRoute

  const isValid =
    !swapInputError && !insufficientLiquidityError && !swapUnavailable

  const swapCallback = useSwapCallback(trade, userSlippageTolerance)

  const handleSwap = useCallback(async () => {
    if (!swapCallback) {
      return
    }
    try {
      await swapCallback()
      /**
       * wait for store state to propagate into the ui and show the action screen
       * otherwise the user will see a flash of the current screen resetting here
       */
      await delay(0)
      onUserInput(Field.PAY, "")
    } catch {
      setSwapUnavailable(true)
    }
  }, [onUserInput, swapCallback])

  const showMaxButton = useMemo(
    () => !atMaxAmountInput && !formattedAmounts[Field.PAY] && !hasZeroBalance,
    [atMaxAmountInput, formattedAmounts, hasZeroBalance],
  )

  return (
    <>
      <SwapContainer data-testid="swap-container">
        <Flex
          position="relative"
          flexDirection="column"
          gap="1"
          borderRadius="lg"
        >
          <SwapInputPanel
            type="pay"
            id="swap-input-pay-panel"
            token={payToken}
            value={formattedAmounts[Field.PAY]}
            onUserInput={handleTypeInput}
            onTokenSelect={handleInputSelect}
            showMaxButton={showMaxButton}
            onMax={handleMaxInput}
            otherToken={receiveToken}
            currentBalance={payTokenBalance}
            tradeLoading={tradeLoading}
            insufficientBalance={!isValid && !!formattedAmounts[Field.PAY]}
          />
          <SwapInputPanel
            type="receive"
            id="swap-input-receive-panel"
            token={receiveToken}
            value={formattedAmounts[Field.RECEIVE]}
            onUserInput={handleTypeOutput}
            onTokenSelect={handleOutputSelect}
            otherToken={payToken}
            currentBalance={tokenBalances[Field.RECEIVE]}
            tradeLoading={tradeLoading}
          />
          <SwitchDirectionButton
            aria-label="Switch input and output"
            animation={rotate ? `${spin} 0.125s linear` : ""}
            icon={<StyledSwitchDirectionIcon />}
            onClick={() => {
              setRotate(true)
              setTimeout(() => setRotate(false), 150)
              onSwitchTokens()
            }}
          />
        </Flex>

        {!trade && !swapInputError && tradeLoading && <SwapTradeLoading />}

        {!trade && !isValid && (
          <L2Bold color="neutrals.500" mt="2">
            Powered by AVNU
          </L2Bold>
        )}

        {trade && isValid && (
          <SwapPricesInfo
            tokenIn={payToken}
            tokenOut={receiveToken}
            trade={trade}
          />
        )}

        {isValid && (
          <SwapQuoteRefresh
            trade={trade}
            tradeLoading={tradeLoading}
            tradeError={swapInputError}
          />
        )}
      </SwapContainer>
      <Flex flex={1} />
      <Box mx="4">
        {isValid ? (
          <Button
            data-testid="review-swap-button"
            w="100%"
            bg="primary.500"
            mb="3"
            isDisabled={
              !formattedAmounts[Field.PAY] ||
              !formattedAmounts[Field.RECEIVE] ||
              tradeLoading
            }
            onClick={() => void handleSwap()}
          >
            Review swap
          </Button>
        ) : (
          <Button
            w="100%"
            bg={
              swapInputError === SwapInputError.NO_AMOUNT
                ? "primary.500"
                : "error.500"
            }
            mb="3"
            isDisabled
            data-testid="swap-error-button"
          >
            {swapInputError ? (
              <>{swapInputError}</>
            ) : insufficientLiquidityError ? (
              <>{insufficientLiquidityError}</>
            ) : swapUnavailable ? (
              <>Swap currently unavailable</>
            ) : (
              <>Unknown Error</>
            )}
          </Button>
        )}
      </Box>
    </>
  )
}

export { Swap }
