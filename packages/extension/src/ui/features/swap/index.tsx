import { Button, CellStack, L2, P4, icons } from "@argent/ui"
import {
  Currency,
  CurrencyAmount,
  Field,
  basisPointsToPercent,
  maxAmountSpend,
  tryParseAmount,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useTradeExactIn,
  useUserState,
} from "@argent/x-swap"
import { Box, Flex, IconButton, Tooltip, chakra } from "@chakra-ui/react"
import { useCallback } from "react"

import { useSelectedAccount } from "../accounts/accounts.state"
import { useTokensWithBalance } from "../accountTokens/tokens.state"
import { useNetworkStatuses } from "../networks/useNetworks"
import { SwapInputPanel } from "./ui/SwapInputPanel"
import { SwapPricesInfo } from "./ui/SwapPricesInfo"

const { InfoIcon, SwitchDirectionIcon } = icons

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
    zIndex: 2,
    minHeight: "32px",
    minWidth: "32px",
    padding: "10.25px",
    _active: {
      transform: "translate(-50%, -50%) ",
    },
  },
})

const StyledSwitchDirectionIcon = chakra(SwitchDirectionIcon, {
  baseStyle: {
    color: "neutrals.300",
  },
})

export function Swap() {
  const {
    currencies,
    trade,
    parsedAmount,
    currencyBalances,
    inputError: swapInputError,
    tradeLoading,
  } = useDerivedSwapInfo()
  console.log("🚀 ~ file: index.tsx ~ line 65 ~ Swap ~ trade", trade)

  const networkStatus = useNetworkStatuses()
  console.log("🚀 ~ file: index.tsx ~ line 6 ~ Swap ~ currencies", currencies)
  const { independentField, typedValue, switchCurrencies } = useSwapState()

  const parsedAmounts = {
    [Field.INPUT]:
      independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
    [Field.OUTPUT]:
      independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
  }

  const { onCurrencySelection, onUserInput } = useSwapActionHandlers()

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
  const account = useSelectedAccount()
  const { tokenDetails: ownedTokens } = useTokensWithBalance(account)

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
            showMaxButton={!atMaxAmountInput}
            onMax={handleMaxInput}
            otherCurrency={currencies[Field.OUTPUT]}
            currentBalance={currencyBalances[Field.INPUT]}
            ownedTokens={ownedTokens}
            tradeLoading={tradeLoading}
          />
          <SwitchDirectionButton
            icon={<StyledSwitchDirectionIcon />}
            onClick={switchCurrencies}
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
    </>
  )
}
