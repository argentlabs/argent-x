import { Input, P4 } from "@argent/ui"
import { Currency } from "@argent/x-swap"
import { Button, Flex, IconButton, chakra } from "@chakra-ui/react"

import { isAllowedNumericInputValue } from "../../../components/utils/isAllowedNumericInputValue"

const SwapInputContainer = chakra(Flex, {
  baseStyle: {
    position: "relative",
    flexDirection: "column",
    gap: "2px",
    padding: "16px 20px",
    backgroundColor: "neutrals.800",
    width: "100%",
  },
})

interface SwapInputPanelProps {
  value: string
  type: "pay" | "receive"
  onUserInput: (value: string) => void
  onMax?: () => void
  currency?: Currency | null
  showMaxButton?: boolean
  //   label?: string
  onCurrencySelect?: (currency: Currency) => void
  //   disableCurrencySelect?: boolean
  //   hideBalance?: boolean
  //   hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  //   showCommonBases?: boolean
  //   customBalanceText?: string
  //   disableInput?: boolean
}

export function SwapInputPanel({
  id,
  value,
  onUserInput,
  type,
  currency,
  onCurrencySelect,
  onMax,
  showMaxButton = false,
  otherCurrency,
}: //   onMax,
//   showMaxButton,
//   label,
//   disableCurrencySelect = false,
//   hideInput = false,
//   otherCurrency,
//   showCommonBases,
//   disableInput = false,
SwapInputPanelProps) {
  return (
    <SwapInputContainer
      borderRadius={type === "pay" ? "12px 12px 0 0" : "0 0 12px 12px"}
      id={id}
    >
      <P4 color="neutrals.400">{type === "pay" ? "Pay" : "Receive"}</P4>
      <Input
        variant="flat"
        placeholder="0"
        fontSize="24px"
        fontWeight="600"
        lineHeight="26px"
        paddingInlineStart="0"
        paddingTop="0"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (isAllowedNumericInputValue(e.target.value)) {
            onUserInput(e.target.value)
          }
        }}
      />
      <div>{currency?.symbol}</div>
    </SwapInputContainer>
  )
}
