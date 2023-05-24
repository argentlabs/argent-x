import { Token } from "@argent-x/extension/src/shared/token/type"
import { parsedDefaultTokens } from "@argent-x/extension/src/shared/token/utils"
import { TokenListItem } from "@argent-x/extension/src/ui/features/accountTokens/TokenListItem"
import { TokenDetailsWithBalance } from "@argent-x/extension/src/ui/features/accountTokens/tokens.state"
import { CellStack } from "@argent/ui"
import { BigNumber } from "ethers"
import { ComponentProps } from "react"

export default {
  component: TokenListItem,
}

const tokenWithSymbol = (symbol: string): Token => {
  const token = parsedDefaultTokens.find((token) => token.symbol === symbol)
  if (!token) {
    throw `No token found for symbol ${symbol}`
  }
  return token
}

const ethToken = tokenWithSymbol("ETH")
const testToken = tokenWithSymbol("TEST")

const tokenWithBalance = (
  balance?: number | string,
  token = ethToken,
): TokenDetailsWithBalance => {
  return {
    ...token,
    balance: balance ? BigNumber.from(balance) : undefined,
  }
}

export const Default = {
  render: (props: ComponentProps<typeof TokenListItem>) => (
    <CellStack>
      <TokenListItem {...props}></TokenListItem>
    </CellStack>
  ),

  args: {
    isLoading: false,
    token: tokenWithBalance("1000000000000000000"),
    currencyValue: "1.19905823328686698812",
  },
}

export const Thousands = {
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance("1234000000000000000000"),
    currencyValue: "1199.05823328686698812",
  },
}

export const HighLongBalance = {
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance("12345678000000000000000000"),
    currencyValue: "12345678.19905823328686698812",
  },
}

export const LowLongBalance = {
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: "0.0000002",
  },
}

export const DustLongBalance = {
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance("892308777860895"),
    currencyValue: "1.00948100047026519429651",
  },
}

export const MissingCurrencyValue = {
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: undefined,
  },
}

export const MissingBalance = {
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance(),
  },
}

export const MissingBalanceAndError = {
  ...Default,
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
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance("12345678000000000000000000"),
    currencyValue: "12345678.19905823328686698812",
    variant: "no-currency",
  },
}

export const MissingCurrencyValueNoCurrencyVariant = {
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance("100000000000000"),
    currencyValue: undefined,
    variant: "no-currency",
  },
}

export const LongTokenNameAndBalance = {
  ...Default,
  args: {
    isLoading: false,
    token: tokenWithBalance("400", testToken),
    currencyValue: undefined,
    variant: "no-currency",
  },
}
