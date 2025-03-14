import { TokenListItem } from "@argent-x/extension/src/ui/features/accountTokens/TokenListItem"
import { CellStack } from "@argent/x-ui"
import type { Meta, StoryObj } from "@storybook/react"
import type { ComponentProps } from "react"

import { tokenWithBalance, tokenWithSymbol } from "../../tokens"

const meta = {
  component: TokenListItem,
  render: (props: ComponentProps<typeof TokenListItem>) => (
    <CellStack>
      <TokenListItem {...props}></TokenListItem>
    </CellStack>
  ),
} satisfies Meta<typeof TokenListItem>

export default meta
type Story = StoryObj<typeof meta>

const longNameToken = {
  ...tokenWithSymbol("STRK"),
  name: "Lorem ipsum dolor sit amet",
}

export const Default: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("1000000000000000000"),
    currencyValue: "1.19905823328686698812",
  },
}

export const Thousands: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("1234000000000000000000"),
    currencyValue: "1199.05823328686698812",
  },
}

export const HighLongBalance: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("12345678000000000000000000"),
    currencyValue: "12345678.19905823328686698812",
  },
}

export const LowLongBalance: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: "0.0000002",
  },
}

export const DustLongBalance: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("892308777860895"),
    currencyValue: "1.00948100047026519429651",
  },
}

export const MissingCurrencyValue: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: undefined,
  },
}

export const MissingBalance: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance(),
    currencyValue: undefined,
  },
}

export const MissingBalanceAndError: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance(),
    currencyValue: undefined,
    errorMessage: {
      message: "Token not found",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
    },
  },
}

export const NoCurrencyVariant: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("12345678000000000000000000"),
    currencyValue: "12345678.19905823328686698812",
    variant: "no-currency",
  },
}

export const MissingCurrencyValueNoCurrencyVariant: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: undefined,
    variant: "no-currency",
  },
}

export const LongTokenNameAndBalance: Story = {
  args: {
    isLoading: false,
    token: tokenWithBalance("400", longNameToken),
    currencyValue: undefined,
    variant: "no-currency",
  },
}
