import { Button, CellStack, L2, icons } from "@argent/ui"
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  Currency,
  CurrencyAmount,
  Field,
  JSBI,
  SupportedNetworks,
  USDC,
  computeTradePriceBreakdown,
  maxAmountSpend,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapCallback,
  useSwapState,
  useUserState,
} from "@argent/x-swap"
import { Box, Flex, IconButton, chakra, useDisclosure } from "@chakra-ui/react"
import { keyframes } from "@chakra-ui/react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { analytics } from "../../../background/analytics"
import { executeTransaction } from "../../services/backgroundTransactions"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { HighPriceImpactModal } from "./ui/HighPriceImpactModal"
import { SwapInputPanel } from "./ui/SwapInputPanel"
import { SwapPricesInfo } from "./ui/SwapPricesInfo"
import { SwapWarning } from "./ui/SwapWarning"

const { SwitchDirectionIcon } = icons

const SwapContainer = chakra(CellStack, {
  baseStyle: {
    position: "relative",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
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

const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(180deg); }
`

const Swap = () => {
  const {
    currencies,
    trade,
    parsedAmount,
    currencyBalances,
    inputError: swapInputError,
    tradeLoading,
  } = useDerivedSwapInfo()
  const { id: networkId } = useCurrentNetwork()
  const { independentField, typedValue, switchCurrencies } = useSwapState()
  const { onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const [rotate, setRotate] = useState(false)
  const { userSlippageTolerance } = useUserState()

  const {
    isOpen: isPISopen,
    onOpen: onPISopen,
    onClose: onPISclose,
  } = useDisclosure()

  const parsedAmounts = {
    [Field.INPUT]:
      independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
    [Field.OUTPUT]:
      independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
  }

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput],
  )

  const dependentField: Field =
    independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  }

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(
    currencyBalances[Field.INPUT],
  )

  const atMaxAmountInput = Boolean(
    maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput),
  )

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      onCurrencySelection(Field.INPUT, inputCurrency)
      handleTypeInput("")
    },
    [handleTypeInput, onCurrencySelection],
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) =>
      onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection],
  )

  const noRoute = !trade?.route

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )

  const insufficientLiquidityError =
    !tradeLoading && userHasSpecifiedInputOutput && noRoute

  const isValid = !swapInputError && !insufficientLiquidityError

  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    userSlippageTolerance,
  )

  const handleSwap = useCallback(() => {
    if (swapCallbackError) {
      console.error(swapCallbackError)
      return
    }

    if (swapCallback) {
      const swapCalls = swapCallback()

      analytics.track("swapInitiated", {
        networkId,
        pair:
          trade?.inputAmount.currency.symbol +
          "-" +
          trade?.outputAmount.currency.symbol,
      })

      return executeTransaction({ transactions: swapCalls }).then(() => {
        onUserInput(Field.INPUT, "")
      })
    }
  }, [
    networkId,
    onUserInput,
    swapCallback,
    swapCallbackError,
    trade?.inputAmount.currency.symbol,
    trade?.outputAmount.currency.symbol,
  ])

  useEffect(() => {
    onCurrencySelection(
      Field.OUTPUT,
      networkId === SupportedNetworks.MAINNET
        ? USDC[SupportedNetworks.MAINNET]
        : USDC[SupportedNetworks.TESTNET],
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId])

  const { priceImpactWithoutFee: priceImpact } = useMemo(
    () => computeTradePriceBreakdown(trade),
    [trade],
  )

  const isPriceImpactHigh = useMemo(() => {
    return priceImpact && !priceImpact.lessThan(ALLOWED_PRICE_IMPACT_HIGH)
  }, [priceImpact])

  return (
    <>
      <SwapContainer>
        <Flex
          position="relative"
          flexDirection="column"
          gap="1"
          borderRadius="lg"
        >
          <SwapInputPanel
            type="pay"
            id="swap-input-pay-panel"
            currency={currencies[Field.INPUT]}
            value={formattedAmounts[Field.INPUT]}
            onUserInput={handleTypeInput}
            onCurrencySelect={handleInputSelect}
            showMaxButton={!atMaxAmountInput && !formattedAmounts[Field.INPUT]}
            onMax={handleMaxInput}
            otherCurrency={currencies[Field.OUTPUT]}
            currentBalance={currencyBalances[Field.INPUT]}
            tradeLoading={tradeLoading}
            insufficientBalance={!isValid && !!formattedAmounts[Field.INPUT]}
          />
          <SwapInputPanel
            type="receive"
            id="swap-input-receive-panel"
            currency={currencies[Field.OUTPUT]}
            value={formattedAmounts[Field.OUTPUT]}
            onUserInput={handleTypeOutput}
            onCurrencySelect={handleOutputSelect}
            otherCurrency={currencies[Field.INPUT]}
            currentBalance={currencyBalances[Field.OUTPUT]}
            tradeLoading={tradeLoading}
          />
          <SwitchDirectionButton
            aria-label="Switch input and output"
            animation={rotate ? `${spin} 0.125s linear` : ""}
            icon={<StyledSwitchDirectionIcon />}
            onClick={() => {
              setRotate(true)
              setTimeout(() => setRotate(false), 150)
              switchCurrencies()
            }}
          />
        </Flex>

        {trade && (
          <SwapPricesInfo
            currencyIn={currencies[Field.INPUT]}
            currencyOut={currencies[Field.OUTPUT]}
            trade={trade}
            priceImpact={priceImpact}
            isPriceImpactHigh={isPriceImpactHigh}
          />
        )}

        <L2
          textAlign="center"
          mt="4"
          as={"a"}
          rounded={"lg"}
          color={"neutrals.500"}
          href="https://jediswap.xyz/"
          title="JediSwap"
          target="_blank"
          _hover={{
            textDecoration: "underline",
          }}
        >
          Powered by JediSwap
        </L2>
      </SwapContainer>
      <Flex flex={1} />
      <Box mx="4">
        {isValid ? (
          <Button
            isLoading={tradeLoading}
            w="100%"
            bg="primary.500"
            mb="6"
            disabled={
              !formattedAmounts[Field.INPUT] || !formattedAmounts[Field.OUTPUT]
            }
            onClick={() => {
              isPriceImpactHigh ? onPISopen() : handleSwap()
            }}
          >
            Review swap
          </Button>
        ) : (
          <Button
            isLoading={tradeLoading}
            w="100%"
            bg={swapInputError ? "primary.500" : "error.500"}
            mb="6"
            disabled
          >
            {swapInputError ? (
              <>{swapInputError}</>
            ) : insufficientLiquidityError ? (
              <>{insufficientLiquidityError}</>
            ) : (
              <>Unknown Error</>
            )}
          </Button>
        )}
      </Box>
      <SwapWarning />

      {isPISopen && (
        <HighPriceImpactModal
          isOpen={isPISopen}
          onClose={onPISclose}
          onAccept={handleSwap}
        />
      )}
    </>
  )
}

export { Swap }
