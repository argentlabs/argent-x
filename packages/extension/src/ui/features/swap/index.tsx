import { CellStack, L2, icons } from "@argent/ui"
import {
  Currency,
  CurrencyAmount,
  Field,
  maxAmountSpend,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from "@argent/x-swap"
import { IconButton, chakra } from "@chakra-ui/react"
import { useCallback } from "react"

import { useSelectedAccount } from "../accounts/accounts.state"
import { useTokensWithBalance } from "../accountTokens/tokens.state"
import { useNetworkStatuses } from "../networks/useNetworks"
import { SwapInputPanel } from "./ui/SwapInputPanel"

const { SwitchDirectionIcon } = icons

const SwapContainer = chakra(CellStack, {
  baseStyle: {
    position: "relative",
    flexDirection: "column",
    borderRadius: "12px",
    boxShadow: " 0px 4px 20px rgba(0, 0, 0, 0.5)",
    backgroundColor: "neutrals.900",
    gap: "2px",
    justifyContent: "center",
    alignItems: "center",
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

  const { onSwitchTokens, onCurrencySelection, onUserInput } =
    useSwapActionHandlers()

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
        />
      </SwapContainer>
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
    </>
  )
}
