import { Option } from "@argent-x/extension/src/ui/components/Options"
import CardSvg from "@argent-x/extension/src/ui/features/funding/card.svg"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Option",
  component: Option,
} as ComponentMeta<typeof Option>

const Template: ComponentStory<typeof Option> = (props) => (
  <Option {...props}></Option>
)

export const BuyWithCard = Template.bind({})
BuyWithCard.args = {
  title: "Buy with card or bank transfer",
  icon: <CardSvg />,
  hideArrow: true,
}

export const FromAnExchange = Template.bind({})
FromAnExchange.args = {
  title: "From an exchange",
  description: "Coinbase, Binance, etc",
  icon: <CardSvg />,
}

export const BridgeFromEthereum = Template.bind({})
BridgeFromEthereum.args = {
  title: "Bridge from Ethereum and other chains",
  icon: <CardSvg />,
}

export const Disabled = Template.bind({})
Disabled.args = {
  title: "High security",
  description: "Coming soon",
  icon: <CardSvg />,
  disabled: true,
}

export const Warn = Template.bind({})
Warn.args = {
  title: "Low security",
  description: "Save a recovery phrase",
  icon: <CardSvg />,
  variant: "warn",
}

export const Danger = Template.bind({})
Danger.args = {
  title: "Low security",
  description: "Save a recovery phrase",
  icon: <CardSvg />,
  variant: "danger",
}
