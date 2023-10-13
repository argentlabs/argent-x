import { TokenListItem } from "@argent-x/extension/src/ui/features/accountTokens/TokenListItem"
import { TokenDetailsWithBalance } from "@argent-x/extension/src/ui/features/accountTokens/tokens.state"
import { CellStack } from "@argent/ui"
import { ComponentProps } from "react"
import { tokenWithBalance, tokenWithSymbol } from "../../tokens"

export default {
  component: TokenListItem,
  parameters: {
    layout: "fullscreen",
  },
  render: (props: ComponentProps<typeof TokenListItem>) => (
    <CellStack>
      <TokenListItem {...props}></TokenListItem>
    </CellStack>
  ),
}

const longNameToken = tokenWithSymbol("wstETH")

export const Default = {
  args: {
    isLoading: false,
    token: tokenWithBalance("1000000000000000000"),
    currencyValue: "1.19905823328686698812",
  },
}

export const Thousands = {
  args: {
    isLoading: false,
    token: tokenWithBalance("1234000000000000000000"),
    currencyValue: "1199.05823328686698812",
  },
}

export const HighLongBalance = {
  args: {
    isLoading: false,
    token: tokenWithBalance("12345678000000000000000000"),
    currencyValue: "12345678.19905823328686698812",
  },
}

export const LowLongBalance = {
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: "0.0000002",
  },
}

export const DustLongBalance = {
  args: {
    isLoading: false,
    token: tokenWithBalance("892308777860895"),
    currencyValue: "1.00948100047026519429651",
  },
}

export const MissingCurrencyValue = {
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: undefined,
  },
}

export const MissingBalance = {
  args: {
    isLoading: false,
    token: tokenWithBalance(),
  },
}

export const MissingBalanceAndError = {
  args: {
    isLoading: false,
    token: tokenWithBalance(),
    errorMessage: {
      message: "Token not found",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
    },
  },
}

export const NoCurrencyVariant = {
  args: {
    isLoading: false,
    token: tokenWithBalance("12345678000000000000000000"),
    currencyValue: "12345678.19905823328686698812",
    variant: "no-currency",
  },
}

export const MissingCurrencyValueNoCurrencyVariant = {
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: undefined,
    variant: "no-currency",
  },
}

export const LongTokenNameAndBalance = {
  args: {
    isLoading: false,
    token: tokenWithBalance("400", longNameToken),
    currencyValue: undefined,
    variant: "no-currency",
  },
}
