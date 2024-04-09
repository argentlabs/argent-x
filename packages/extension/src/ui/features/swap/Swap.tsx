import { Button, CellStack, L2, icons } from "@argent/x-ui"
import { Box, Flex, IconButton, chakra, keyframes } from "@chakra-ui/react"
import { useCallback, useMemo, useState } from "react"

import { SwapInputPanel } from "./ui/SwapInputPanel"
import { SwapPricesInfo } from "./ui/SwapPricesInfo"
import { SwapInputError, useSwapInfo } from "./hooks/useSwapInfo"
import { bigDecimal, ensureDecimals } from "@argent/x-shared"
import { Field, useSwapState } from "./state/fields"
import { useSwapActionHandlers } from "./hooks/useSwapActionHandler"
import { Token } from "../../../shared/token/__new/types/token.model"
import { maxAmountSpendFromTokenBalance } from "./utils"
import { SwapTradeLoading } from "./ui/SwapTradeLoading"
import { useSwapCallback } from "./hooks/useSwapCallback"
import { useAppState } from "../../app.state"
import { useUserState } from "./state/user"
import { SwapQuoteRefresh } from "./ui/SwapQuoteRefresh"

const { SwitchDirectionIcon } = icons

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

const StyledSwitchDirectionIcon = chakra(SwitchDirectionIcon, {
  baseStyle: {
    color: "neutrals.300",
  },
})

export const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(180deg); }
`

const Swap = () => {
  const {
    tokens,
    tokenBalances,
    trade,
    tradeLoading,
    parsedAmount,
    inputError: swapInputError,
  } = useSwapInfo()
  const { independentField, typedValue } = useSwapState()
  const { onTokenSelection, onUserInput, onSwitchTokens } =
    useSwapActionHandlers()
  const { userSlippageTolerance } = useUserState()
  const { switcherNetworkId: networkId } = useAppState()

  const [rotate, setRotate] = useState(false)
  const [swapUnavailable, setSwapUnavailable] = useState(false)

  const payToken = tokens[Field.PAY]
  const receiveToken = tokens[Field.RECEIVE]

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
    maxAmountInput !== undefined &&
      payToken?.decimals &&
      onUserInput(
        Field.PAY,
        bigDecimal.formatUnits({
          value: maxAmountInput,
          decimals: payToken.decimals,
        }),
      )
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

  const handleSwap = useCallback(() => {
    if (swapCallback) {
      return swapCallback()
        .then(() => {
          onUserInput(Field.PAY, "")
        })
        .catch(() => {
          setSwapUnavailable(true)
        })
    }
  }, [swapCallback, onUserInput, payToken, receiveToken, networkId])

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
          <L2 color="neutrals.500" mt="2">
            Powered by AVNU
          </L2>
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
            w="100%"
            bg="primary.500"
            mb="3"
            isDisabled={
              !formattedAmounts[Field.PAY] ||
              !formattedAmounts[Field.RECEIVE] ||
              tradeLoading
            }
            onClick={handleSwap}
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
