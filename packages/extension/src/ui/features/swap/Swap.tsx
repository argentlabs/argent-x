import { Button, CellStack, L2, icons } from "@argent/ui"
import {
  Currency,
  CurrencyAmount,
  Field,
  SupportedNetworks,
  USDC,
  maxAmountSpend,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from "@argent/x-swap"
import { Box, Flex, IconButton, chakra } from "@chakra-ui/react"
import { keyframes } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"

import { useSelectedAccount } from "../accounts/accounts.state"
import { useTokensWithBalance } from "../accountTokens/tokens.state"
import { useCurrentNetwork } from "../networks/useNetworks"
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
    zIndex: 1,
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

  const account = useSelectedAccount()
  const { id: networkId } = useCurrentNetwork()
  const { tokenDetails: ownedTokens } = useTokensWithBalance(account)
  const { independentField, typedValue, switchCurrencies } = useSwapState()
  const { onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const [rotate, setRotate] = useState(false)

  const parsedAmounts = {
    [Field.INPUT]:
      independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
    [Field.OUTPUT]:
      independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
  }

  const isValid = !swapInputError

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

  useEffect(() => {
    onCurrencySelection(
      Field.OUTPUT,
      networkId === SupportedNetworks.MAINNET
        ? USDC[SupportedNetworks.MAINNET]
        : USDC[SupportedNetworks.TESTNET],
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId])

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
            ownedTokens={ownedTokens}
            tradeLoading={tradeLoading}
            insufficientBalance={!isValid && !!formattedAmounts[Field.INPUT]}
          />
          <SwitchDirectionButton
            animation={rotate ? `${spin} 0.125s linear` : ""}
            icon={<StyledSwitchDirectionIcon />}
            onClick={() => {
              setRotate(true)
              setTimeout(() => setRotate(false), 150)
              switchCurrencies()
            }}
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
        </Flex>

        {trade && (
          <SwapPricesInfo
            currencyIn={currencies[Field.INPUT]}
            currencyOut={currencies[Field.OUTPUT]}
            trade={trade}
          />
        )}

        <L2
          textAlign="center"
          mt="4"
          as={"a"}
          rounded={"lg"}
          color={"neutrals.500"}
          href="https://jediswap.xyz/"
          title="Jediswap"
          target="_blank"
          _hover={{
            textDecoration: "underline",
          }}
        >
          Powered by Jediswap
        </L2>
      </SwapContainer>
      <Flex flex={1} />
      <Box mx="4">
        <Button
          isLoading={tradeLoading}
          w="100%"
          bg={
            isValid ||
            !formattedAmounts[Field.INPUT] ||
            !formattedAmounts[Field.OUTPUT]
              ? "primary.500"
              : "error.500"
          }
          mb="6"
          disabled={
            !formattedAmounts[Field.INPUT] ||
            !formattedAmounts[Field.OUTPUT] ||
            !isValid
          }
        >
          {!swapInputError && <>Review swap</>}
          {!!swapInputError && <>{swapInputError}</>}
        </Button>
      </Box>
      <SwapWarning />
    </>
  )
}

export { Swap }
