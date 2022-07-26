import defaultTokens from "@argent-x/extension/src/assets/default-tokens.json"
import { TokenListItem } from "@argent-x/extension/src/ui/features/accountTokens/TokenListItem"
import { TokenDetailsWithBalance } from "@argent-x/extension/src/ui/features/accountTokens/tokens.state"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { BigNumber } from "ethers"

export default {
  title: "features/TokenListItem",
  component: TokenListItem,
} as ComponentMeta<typeof TokenListItem>

const Template: ComponentStory<typeof TokenListItem> = (props) => (
  <TokenListItem {...props}></TokenListItem>
)

const token = defaultTokens[0]

const tokenWithBalance = (
  balance?: number | string,
): TokenDetailsWithBalance => {
  return {
    ...token,
    networkId: token.network,
    decimals: Number(token.decimals),
    balance: balance ? BigNumber.from(balance) : undefined,
  }
}

export const Default = Template.bind({})
Default.args = {
  isLoading: false,
  token: tokenWithBalance("1000000000000000000"),
  currencyValue: "1.19905823328686698812",
}

export const Thousands = Template.bind({})
Thousands.args = {
  isLoading: false,
  token: tokenWithBalance("1234000000000000000000"),
  currencyValue: "1199.05823328686698812",
}

export const HighLongBalance = Template.bind({})
HighLongBalance.args = {
  isLoading: false,
  token: tokenWithBalance("12345678000000000000000000"),
  currencyValue: "12345678.19905823328686698812",
}

export const LowLongBalance = Template.bind({})
LowLongBalance.args = {
  isLoading: false,
  token: tokenWithBalance("100000000000000"),
  currencyValue: "0.0000002",
}

export const DustLongBalance = Template.bind({})
DustLongBalance.args = {
  isLoading: false,
  token: tokenWithBalance("892308777860895"),
  currencyValue: "1.00948100047026519429651",
}

export const MissingCurrencyValue = Template.bind({})
MissingCurrencyValue.args = {
  isLoading: false,
  token: tokenWithBalance("100000000000000"),
  currencyValue: undefined,
}

export const MissingBalance = Template.bind({})
MissingBalance.args = {
  isLoading: false,
  token: tokenWithBalance(),
}

export const NoCurrencyVariant = Template.bind({})
NoCurrencyVariant.args = {
  isLoading: false,
  token: tokenWithBalance("12345678000000000000000000"),
  currencyValue: "12345678.19905823328686698812",
  variant: "no-currency",
}

export const MissingCurrencyValueNoCurrencyVariant = Template.bind({})
MissingCurrencyValueNoCurrencyVariant.args = {
  isLoading: false,
  token: tokenWithBalance("100000000000000"),
  currencyValue: undefined,
  variant: "no-currency",
}
